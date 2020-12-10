/*jsondoc={
    "version": "1.8.1",
    "script_name": "gulp_place_type",
    "description": "Temporaly workaround for type definition for [jaandrle/gulp-place](https://github.com/jaandrle/gulp-place).",
    "root_path": "gulp_tasks"
}*/
/**
 * This is build-time pattern/"function" pasting file(s)/variable(s) content.
 * @global
 * @param {string} target See `type`. In case of file(s) can be used also variable pattern `some_folder/${file_var}`|`${folder_var}/some_file` (`${}` is evaluated by `variable_eval`).
 * @param {string} [type='file'] 
 *  - **"files"**, **"glob"**: Places all files matching `target` pattern (e.g. `some_folder/*.*` – all files in `some_folder`).
 *  - **"file"**: Places file content based on `target`.
 *  - **"file_if_exists"**: Places file content based on `target`. Silently skips non-founded file.
 *  - **"files_once"**, **"glob_once"**: Ensure loading file once per whole initiation (means 2nd point in [Approach](#approach)).
 *  - **"file_once"**: Ensure loading file once per whole initiation (means 2nd point in [Approach](#approach)).
 *  - **"clean"**: Resets all `*_once`.
 *  - **"combine"** – (`target` in JSON form: `{ glob, file, name, type, depends }`):
 *  - → Creates [module](./templates/module.js)/[namespace](./templates/namespace.js) pattern based on `type` ("namespace" is default). Also supports `type="module_native"`.
 *  - → One of `glob/file` must be defined (`file` has priority) and correspodns to `glob_once/file_once`.
 *  - → `name` sets namespace/module name (default is file/folder name).
 *  - → `depend` is object of names (in case of `type='module'`).
 *  - → In inported files can be used simplified **import/export** syntax:
 *  - →→ `/export (default )?(function|const|let|var|class) (?<name>…)…/g`: Expression is converted to regular definition without export/default keywords and names are exposed. Except *module_native* situation (nothing to change).
 *  - →→ `/import (\* as [^ ]+|{[^}]+}) from "depends:([^"]+)"/g`: 
 *  - →→→ In all "module" situation "depends:*" will be conferted based on `depends` key
 *  - →→→ In *module_native* nothing else will be changed
 *  - →→→ Elsewhere it will be converted into "const …= …;"
 *  - →→→ Keep in mind redefinition! → currently the approach is to use import in one script and others used internal names!
 *  - → See example [combine-test](./tests/combine-test/) in "tests" folder.
 *  - **"variable"**: Evaluate `target` with `variable_eval` and return result surrounded by `string_wrapper`.
 *  - **"eval"**: Evaluate `target` with `variable_eval`. It can be used for dynamic behaviour in building process.
 *  - **"eval_out"**: Evaluate `target` with `variable_eval` and return result without `string_wrapper`.
 * @returns {string}
 */
function gulp_place(param, type){}