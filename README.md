<a name="module_dir-output"></a>

## dir-output
An interface for managing a dir.


* [dir-output](#module_dir-output)
    * [~DirOutput](#module_dir-output..DirOutput)
        * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
        * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>
        * [.remove(file)](#module_dir-output..DirOutput+remove) ⇒ <code>Promise</code>
        * [.createDir(name, empty)](#module_dir-output..DirOutput+createDir)

<a name="module_dir-output..DirOutput"></a>

### dir-output~DirOutput
DirOutput class

**Kind**: inner class of [<code>dir-output</code>](#module_dir-output)  

* [~DirOutput](#module_dir-output..DirOutput)
    * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
    * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>
    * [.remove(file)](#module_dir-output..DirOutput+remove) ⇒ <code>Promise</code>
    * [.createDir(name, empty)](#module_dir-output..DirOutput+createDir)

<a name="new_module_dir-output..DirOutput_new"></a>

#### new DirOutput(outputPath)

| Param | Description |
| --- | --- |
| outputPath | The path to the dir. |

<a name="module_dir-output..DirOutput+empty"></a>

#### dirOutput.empty() ⇒ <code>Promise</code>
Remove all files and dirs in the output dir.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: <code>void</code>  
<a name="module_dir-output..DirOutput+remove"></a>

#### dirOutput.remove(file) ⇒ <code>Promise</code>
Remove a file or recursively remove a dir. Returns true if file was deleted, and false if file did not exist.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: boolean  

| Param | Description |
| --- | --- |
| file | The name of the dir. |

<a name="module_dir-output..DirOutput+createDir"></a>

#### dirOutput.createDir(name, empty)
Creates a dir. If this dir was scheduled to be deleted by a `empty` operation, this dir is not deleted.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  

| Param | Default | Description |
| --- | --- | --- |
| name | <code>true</code> | The name of the dir. |
| empty | <code>true</code> | Whether or not to empty the dir if it was preserved instead of deleted. |

