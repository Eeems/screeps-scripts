// All types should be padded to type.length + 2
// largest type is 'warning' which is 7 characters long.
const typeCol = _.memoize((name) => `<span class="log ${name}">` + _.padLeft(`${name.toUpperCase()}:`, 9) + '</span>'),
    indentCol = _.memoize((level) => _.padLeft('', level * 2)),
    style = JSON.stringify(`
        span.log{
            color: white;
        }
        span.log.info{
            background-color: blue;
        }
        span.log.debug{
            background-color: white;
            color: black;
        }
        span.log.warning{
            background-color: yellow;
            color: black;
        }
        span.log.panic, span.log.error{
            background-color: red;
        }
    `.replace(/\r?\n|\r/g, ''));

let indentLevel = 0;

export class Log{
    public static setup(): void{
        console.log(`<script>
            const style = ${style};
            let tag = document.getElementById('logging-styles');
            if(!tag){
                tag = document.createElement('style');
                tag.textContent = style;
                tag.id = 'logging-styles';
                document.head.append(tag);
            }else if(tag.textContent != style){
                tag.textContent = style;
            }
        </script>`.replace(/\r?\n|\r/g, ''));
    }
    public static info(msg: any): void{
        console.log(`${indentCol(indentLevel)}${typeCol('info')} ${msg}`);
    }
    public static warning(msg: any): void{
        console.log(`${indentCol(indentLevel)}${typeCol('warning')} ${msg}`);
    }
    public static debug(msg: any): void{
        console.log(`${indentCol(indentLevel)}${typeCol('debug')} ${msg}`);
    }
    public static error(msg: any): void{
        console.log(`${indentCol(indentLevel)}${typeCol('error')} ${msg}`);
    }
    public static panic(msg: any): void{
        console.log(`${indentCol(indentLevel)}${typeCol('panic')} ${msg}`);
        Game.notify(`PANIC: ${msg}`, 10);
    }
    public static group(): void{
        indentLevel++;
    }
    public static ungroup(): void{
        if(indentLevel > 0){
            indentLevel--;
        }
    }
    public static reset(){
        indentLevel = 0;
    }
}
