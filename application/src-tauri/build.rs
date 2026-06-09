fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "stat_local_paths",
                "read_local_paths",
                "stage_native_input",
                "read_native_output",
                "remove_native_path",
                "convert_native_file",
            ]),
        ),
    )
    .expect("tauri-build failed");
}
