use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tempfile::TempDir;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConvertNativeArgs {
    category: String,
    input_name: String,
    #[allow(dead_code)]
    input_ext: String,
    output_ext: String,
    input_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConvertNativeResult {
    output_path: String,
    filename: String,
}

const MAX_DROP_FILE_BYTES: u64 = 2 * 1024 * 1024 * 1024;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalFileMeta {
    path: String,
    name: String,
    mime: String,
    size: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalFilePayload {
    name: String,
    mime: String,
    size: u64,
    data: Vec<u8>,
}

fn local_file_meta(path_str: &str) -> Result<LocalFileMeta, String> {
    let path = PathBuf::from(path_str);
    if !path.is_file() {
        return Err(format!("Fichier introuvable : {}", path.display()));
    }
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("Impossible de lire {} : {e}", path.display()))?;
    if metadata.len() > MAX_DROP_FILE_BYTES {
        return Err(format!(
            "Fichier trop volumineux ({}). Limite : 2 Go.",
            path.file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("fichier")
        ));
    }
    let name = path
        .file_name()
        .and_then(|value| value.to_str())
        .map(String::from)
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "fichier".into());
    Ok(LocalFileMeta {
        path: path_str.to_string(),
        mime: mime_from_path(&path),
        size: metadata.len(),
        name,
    })
}

fn mime_from_path(path: &Path) -> String {
    let ext = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" | "jfif" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "avif" => "image/avif",
        "bmp" => "image/bmp",
        "tiff" | "tif" => "image/tiff",
        "ico" => "image/x-icon",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "ogg" => "audio/ogg",
        "flac" => "audio/flac",
        "m4a" => "audio/mp4",
        "mp4" | "m4v" => "video/mp4",
        "webm" => "video/webm",
        "mkv" => "video/x-matroska",
        "mov" => "video/quicktime",
        "pdf" => "application/pdf",
        "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "csv" => "text/csv",
        "json" => "application/json",
        "txt" | "md" => "text/plain",
        "html" | "htm" => "text/html",
        _ => "application/octet-stream",
    }
    .into()
}

fn output_filename(input_name: &str, output_ext: &str) -> String {
    let stem = Path::new(input_name)
        .file_stem()
        .and_then(|s| s.to_str())
        .filter(|s| !s.is_empty())
        .unwrap_or("fichier");
    format!("{stem}.{output_ext}")
}

fn command_exists(program: &str) -> bool {
    Command::new(program)
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn run_ffmpeg(input: &Path, output: &Path) -> Result<(), String> {
    if !command_exists("ffmpeg") {
        return Err(
            "FFmpeg est introuvable. Installez FFmpeg et assurez-vous qu'il est dans le PATH."
                .into(),
        );
    }

    let status = Command::new("ffmpeg")
        .args([
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            &input.to_string_lossy(),
            &output.to_string_lossy(),
        ])
        .status()
        .map_err(|e| format!("Impossible de lancer FFmpeg : {e}"))?;

    if !status.success() {
        return Err(
            "La conversion vidéo a échoué. Vérifiez le format d'entrée et les codecs FFmpeg.".into(),
        );
    }
    Ok(())
}

fn find_libreoffice() -> Option<PathBuf> {
    for candidate in ["soffice", "libreoffice"] {
        if command_exists(candidate) {
            return Some(PathBuf::from(candidate));
        }
    }
    None
}

fn run_libreoffice(input: &Path, output_dir: &Path, output_ext: &str) -> Result<PathBuf, String> {
    let program = find_libreoffice().ok_or_else(|| {
        String::from(
            "LibreOffice est introuvable. Installez LibreOffice pour convertir les fichiers Office et pro.",
        )
    })?;

    let convert_to = match output_ext {
        "docx" => "docx:MS Word 2007 XML",
        "odt" => "odt",
        "xlsx" => "xlsx",
        "txt" => "txt:Text",
        "pdf" => "pdf",
        other => other,
    };

    let status = Command::new(&program)
        .args([
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            "--convert-to",
            convert_to,
            "--outdir",
            &output_dir.to_string_lossy(),
            &input.to_string_lossy(),
        ])
        .status()
        .map_err(|e| format!("Impossible de lancer LibreOffice : {e}"))?;

    if !status.success() {
        return Err(
            "La conversion Office a échoué. Vérifiez que LibreOffice prend en charge ce format."
                .into(),
        );
    }

    let stem = input
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("fichier");
    let expected = output_dir.join(format!("{stem}.{output_ext}"));
    if expected.is_file() {
        return Ok(expected);
    }

    let entries = fs::read_dir(output_dir)
        .map_err(|e| format!("Impossible de lire le dossier de sortie : {e}"))?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if ext.eq_ignore_ascii_case(output_ext) {
                    return Ok(path);
                }
            }
        }
    }

    Err("LibreOffice n'a produit aucun fichier de sortie.".into())
}

fn convert_video(input: &Path, output: &Path) -> Result<(), String> {
    run_ffmpeg(input, output)
}

fn ffmpeg_has_encoder(encoder: &str) -> bool {
    Command::new("ffmpeg")
        .args(["-hide_banner", "-encoders"])
        .output()
        .ok()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .lines()
                .any(|line| line.contains(encoder))
        })
        .unwrap_or(false)
}

fn convert_image(input: &Path, output: &Path, output_ext: &str) -> Result<(), String> {
    if !command_exists("ffmpeg") {
        return Err(
            "FFmpeg est introuvable. Installez FFmpeg pour convertir les images (et la vidéo)."
                .into(),
        );
    }

    let ext = output_ext.to_ascii_lowercase();
    if ext == "svg" {
        return Err(
            "Conversion vers SVG vectoriel : non disponible dans l'application desktop."
                .into(),
        );
    }

    match ext.as_str() {
        "heic" | "heif" if !ffmpeg_has_encoder("libheif") => {
            return Err(
                "Sortie HEIF/HEIC : codec FFmpeg (libheif) indisponible. Choisissez WebP, PNG ou JPEG."
                    .into(),
            );
        }
        "avif" if !ffmpeg_has_encoder("libaom_av1") && !ffmpeg_has_encoder("libsvtav1") => {
            return Err(
                "Sortie AVIF : codec FFmpeg indisponible. Choisissez WebP, PNG ou JPEG."
                    .into(),
            );
        }
        "jxl" if !ffmpeg_has_encoder("libjxl") => {
            return Err(
                "Sortie JXL : codec FFmpeg (libjxl) indisponible. Choisissez WebP, PNG ou JPEG."
                    .into(),
            );
        }
        _ => {}
    }

    let input_str = input.to_string_lossy().to_string();
    let output_str = output.to_string_lossy().to_string();

    let mut cmd = Command::new("ffmpeg");
    cmd.args(["-hide_banner", "-loglevel", "error", "-y", "-i", &input_str, "-frames:v", "1"]);

    match ext.as_str() {
        "jpg" | "jpeg" => {
            cmd.args(["-update", "1", "-q:v", "3"]);
        }
        "webp" => {
            cmd.args(["-c:v", "libwebp", "-quality", "85"]);
        }
        "png" => {
            cmd.args(["-update", "1", "-compression_level", "6"]);
        }
        "gif" => {
            cmd.args(["-update", "1", "-pix_fmt", "rgb24"]);
        }
        "bmp" | "tiff" | "tif" | "ico" => {}
        "avif" => {
            cmd.args([
                "-c:v",
                "libaom-av1",
                "-still_picture",
                "1",
                "-crf",
                "28",
            ]);
        }
        "apng" => {
            cmd.args(["-f", "apng", "-plays", "0"]);
        }
        "jxl" => {
            cmd.args(["-c:v", "libjxl"]);
        }
        "heic" | "heif" => {
            cmd.args(["-c:v", "libheif"]);
        }
        "pdf" => {
            cmd.args(["-f", "pdf"]);
        }
        _ => {}
    }

    cmd.arg(&output_str);

    let status = cmd
        .status()
        .map_err(|e| format!("Impossible de lancer FFmpeg : {e}"))?;

    if !status.success() || !output.is_file() {
        return Err(format!(
            "Conversion image vers {ext} échouée. Vérifiez le format d'entrée ou installez les codecs FFmpeg nécessaires."
        ));
    }

    Ok(())
}

fn convert_office(input: &Path, output_ext: &str, work_dir: &Path) -> Result<PathBuf, String> {
    let output_dir = work_dir.join("out");
    fs::create_dir_all(&output_dir)
        .map_err(|e| format!("Impossible de créer le dossier temporaire : {e}"))?;
    run_libreoffice(input, &output_dir, output_ext)
}

fn persist_output(output_path: &Path, output_ext: &str) -> Result<PathBuf, String> {
    let file_name = format!(
        "cal-out-{}-{}.{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0),
        output_ext
    );
    let dest = std::env::temp_dir().join(file_name);
    fs::copy(output_path, &dest)
        .map_err(|e| format!("Impossible de copier le fichier converti : {e}"))?;
    Ok(dest)
}

#[tauri::command]
pub fn stat_local_paths(paths: Vec<String>) -> Result<Vec<LocalFileMeta>, String> {
    if paths.is_empty() {
        return Err("Aucun fichier dans le dépôt.".into());
    }

    let mut metas = Vec::new();
    for path_str in paths {
        match local_file_meta(&path_str) {
            Ok(meta) => metas.push(meta),
            Err(err) if metas.is_empty() => return Err(err),
            Err(_) => continue,
        }
    }

    if metas.is_empty() {
        return Err("Aucun fichier lisible dans le dépôt.".into());
    }

    Ok(metas)
}

#[tauri::command]
pub fn read_local_paths(paths: Vec<String>) -> Result<Vec<LocalFilePayload>, String> {
    if paths.is_empty() {
        return Err("Aucun fichier dans le dépôt.".into());
    }

    let mut payloads = Vec::new();
    for path_str in paths {
        let meta = local_file_meta(&path_str)?;
        let data = fs::read(&path_str).map_err(|e| format!("Impossible de lire {} : {e}", meta.name))?;
        payloads.push(LocalFilePayload {
            mime: meta.mime,
            size: data.len() as u64,
            name: meta.name,
            data,
        });
    }

    Ok(payloads)
}

#[tauri::command]
pub fn stage_native_input(input_ext: String, data: Vec<u8>) -> Result<String, String> {
    if data.is_empty() {
        return Err("Fichier vide ou illisible.".into());
    }
    let safe_ext = input_ext.trim_start_matches('.');
    let file_name = format!(
        "cal-in-{}-{}.{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0),
        safe_ext
    );
    let path = std::env::temp_dir().join(file_name);
    fs::write(&path, &data).map_err(|e| format!("Impossible d'écrire le fichier source : {e}"))?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
pub async fn read_native_output(output_path: String) -> Result<Vec<u8>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = PathBuf::from(&output_path);
        if !path.is_file() {
            return Err("Fichier converti introuvable.".into());
        }
        fs::read(&path).map_err(|e| format!("Impossible de lire le fichier converti : {e}"))
    })
    .await
    .map_err(|err| format!("Lecture interrompue : {err}"))?
}

#[tauri::command]
pub fn remove_native_path(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);
    if path.is_file() {
        fs::remove_file(&path).map_err(|e| format!("Impossible de supprimer le fichier : {e}"))?;
    }
    Ok(())
}

fn convert_native_file_inner(args: ConvertNativeArgs) -> Result<ConvertNativeResult, String> {
    let input_path = PathBuf::from(&args.input_path);
    if args.input_path.trim().is_empty() {
        return Err(
            "Chemin du fichier vide. Videz la file, redéposez les fichiers, puis réessayez.".into(),
        );
    }
    if !input_path.is_file() {
        return Err(format!(
            "Fichier source introuvable : {}. Redéposez le fichier dans la file.",
            input_path.display()
        ));
    }

    let work_dir = TempDir::new().map_err(|e| format!("Dossier temporaire indisponible : {e}"))?;
    let output_ext = args.output_ext.trim_start_matches('.');

    let output_path = work_dir.path().join(format!("output.{output_ext}"));

    match args.category.as_str() {
        "video" => convert_video(&input_path, &output_path)?,
        "office" => {
            let produced = convert_office(&input_path, output_ext, work_dir.path())?;
            fs::copy(&produced, &output_path)
                .map_err(|e| format!("Impossible de lire le fichier converti : {e}"))?;
        }
        "image" => convert_image(&input_path, &output_path, output_ext)?,
        other => return Err(format!("Catégorie non prise en charge : {other}")),
    }

    if !output_path.is_file() {
        return Err("Aucun fichier de sortie n'a été généré.".into());
    }

    let persisted = persist_output(&output_path, output_ext)?;

    Ok(ConvertNativeResult {
        output_path: persisted.to_string_lossy().into_owned(),
        filename: output_filename(&args.input_name, output_ext),
    })
}

#[tauri::command]
pub async fn convert_native_file(args: ConvertNativeArgs) -> Result<ConvertNativeResult, String> {
    tauri::async_runtime::spawn_blocking(move || convert_native_file_inner(args))
        .await
        .map_err(|err| format!("Conversion interrompue : {err}"))?
}
