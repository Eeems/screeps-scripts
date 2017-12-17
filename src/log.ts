// All types should be padded to type.length + 2
// largest type is 'warning' which is 7 characters long.
const typeCol = _.memoize((name) => `<span class="log ${name}">` + _.padLeft(`${name.toUpperCase()}:`, 9) + '</span>'),
    indentCol = _.memoize((level) => _.padLeft('', level * 2));

let indentLevel = 0;

export class Log{
    public static setup(): void{
        console.log(`<style>
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
        </style>`.replace(/\r?\n|\r/g, ''));
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
