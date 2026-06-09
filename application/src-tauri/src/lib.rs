mod converter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            converter::stat_local_paths,
            converter::read_local_paths,
            converter::stage_native_input,
            converter::read_native_output,
            converter::remove_native_path,
            converter::convert_native_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
