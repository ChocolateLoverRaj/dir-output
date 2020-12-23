<a name="module_dir-output"></a>

## dir-output
An interface for managing a dir.


* [dir-output](#module_dir-output)
    * [~DirOutput](#module_dir-output..DirOutput)
        * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
        * [.remove(file)](#module_dir-output..DirOutput+remove) ⇒ <code>Promise</code>
        * [.createDir(name, empty)](#module_dir-output..DirOutput+createDir) ⇒ <code>Promise</code>
        * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>

<a name="module_dir-output..DirOutput"></a>

### dir-output~DirOutput
DirOutput class

**Kind**: inner class of [<code>dir-output</code>](#module_dir-output)  

* [~DirOutput](#module_dir-output..DirOutput)
    * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
    * [.remove(file)](#module_dir-output..DirOutput+remove) ⇒ <code>Promise</code>
    * [.createDir(name, empty)](#module_dir-output..DirOutput+createDir) ⇒ <code>Promise</code>
    * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>

<a name="new_module_dir-output..DirOutput_new"></a>

#### new DirOutput(outputPath)

| Param | Description |
| --- | --- |
| outputPath | The path to the dir. |

<a name="module_dir-output..DirOutput+remove"></a>

#### dirOutput.remove(file) ⇒ <code>Promise</code>
Remove a file or recursively remove a dir. Returns true if file was deleted, and false if file did not exist.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: boolean  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | The name of the dir. |

<a name="module_dir-output..DirOutput+createDir"></a>

#### dirOutput.createDir(name, empty) ⇒ <code>Promise</code>
Creates a dir. If this dir was scheduled to be deleted by a `empty` operation, this dir is not deleted. Returns a DirOutput with the outputPath being the path of the dir that was created.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: DirOutput  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | The name of the dir. |
| empty | <code>boolean</code> | <code>true</code> | Whether or not to empty the dir if it was preserved instead of deleted. |

<a name="module_dir-output..DirOutput+empty"></a>

#### dirOutput.empty() ⇒ <code>Promise</code>
Remove all files and dirs in the output dir.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: void  
