<a name="module_dir-output"></a>

## dir-output
An interface for managing a dir.


* [dir-output](#module_dir-output)
    * [~DirOutput](#module_dir-output..DirOutput)
        * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
        * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>
        * [.removeDir(dir)](#module_dir-output..DirOutput+removeDir) ⇒ <code>Promise</code>

<a name="module_dir-output..DirOutput"></a>

### dir-output~DirOutput
DirOutput class

**Kind**: inner class of [<code>dir-output</code>](#module_dir-output)  

* [~DirOutput](#module_dir-output..DirOutput)
    * [new DirOutput(outputPath)](#new_module_dir-output..DirOutput_new)
    * [.empty()](#module_dir-output..DirOutput+empty) ⇒ <code>Promise</code>
    * [.removeDir(dir)](#module_dir-output..DirOutput+removeDir) ⇒ <code>Promise</code>

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
<a name="module_dir-output..DirOutput+removeDir"></a>

#### dirOutput.removeDir(dir) ⇒ <code>Promise</code>
Remove a sub dir. Returns true if file was deleted, and false if file did not exist.

**Kind**: instance method of [<code>DirOutput</code>](#module_dir-output..DirOutput)  
**Fulfil**: boolean  

| Param | Description |
| --- | --- |
| dir | The name of the dir. |

