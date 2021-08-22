function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Queue {
    constructor(size)
    {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val)
    {
        if(this.length == this.data.length)
        {
            console.log("Error queue limit reached!");
        }
            this.data[this.end++] = val; 
            this.end %= this.data.length;
            this.length++;
        
    }
    pop()
    {
        if(this.length)
        {
            const val = this.data[this.start];
            this.start++;
            this.start %= this.data.length;
            this.length--;
            return val;
        }
        return false;
    }
    get(index)
    {
        if(index < this.length)
        {
            return this.data[(index+this.start)%this.data.length];
        }
        return false;
    }
    set(index, obj)
    {
        if(index < this.length)
        {
            this.data[(index+this.start)%this.data.length] = obj;
        }
    }
}

class Field{
    constructor(canvas, ctx, maxLevel)
    {
        this.canvas = canvas;
        this.ctx = ctx;
        this.boundedWidth = canvas.width/8*5;
        this.boundedHeight = canvas.height;
        this.w = 10;
        this.h = 25;
        this.mousePos = {x:0, y:0};
        this.active = true;
        this.score = 0;
        this.level = 0;
        this.maxLevel = maxLevel+1;
        this.lastRowsCleared = 0;
        this.pieceTypes = [
            //T
            {
                type:"t",
                center: [this.w/2,1],
                vectors:[[0,0],[-1,-1],[0,-1],[1,-1]],
                color:"#A000B8"//
            },
            //O
            {
                type:"o",
                center: [this.w/2,1],
                vectors:[[0,0],[-1,-1],[0,-1],[-1,0]],
                color:"#D0D000"//
            },
            //Z
            {
                type:"z",
                center: [this.w/2,1],
                vectors:[[0,0],[-1,-1],[0,-1],[1,0]],
                color:"#AA0A00"//
            },
            //S
            {
                type:"s",
                center: [this.w/2,1],
                vectors:[[0,0],[-1,0],[0,-1],[1,-1]],
                color:"#00C000"//
            },
            //i
            {
                type:"i",
                center: [this.w/2,1],
                vectors:[[0,-1],[0,0],[0,1],[0,2]],
                color:"#00A0D0"//
            },
            //L
            {
                type:"l",
                center: [this.w/2,1],
                vectors:[[-1,-1],[-1,0],[-1,1],[0,1]],
                color:"#F0B000"//
            },
            //j
            {
                type:"j",
                center: [this.w/2,1],
                vectors:[[1,-1],[1,0],[1,1],[0,1]],
                color:"#0020D0"//blue
            }

        ];
        
        this.holdPiece;
        this.livePiece = this.genRandomNewPiece();
        this.field = [];
        this.pieceQueue = new Queue(5);
        for(let i = 0; i < this.pieceQueue.data.length; i++)
        {
            this.pieceQueue.push(this.genRandomNewPiece());
        }
        for(let i = 0; i < this.w*this.h;i++)
        {
            this.field.push({color:"#000000"});
        }
    }
    genRandomNewPiece()
    {
        return this.clonePiece(this.pieceTypes[Math.floor(Math.random() * (this.pieceTypes.length))]);
    }
    clonePiece(piece)
    {
        const newPiece = {type:piece.type,center:[piece.center[0], piece.center[1]], vectors:[], color:piece.color};
        for(let i = 0; i < piece.vectors.length; i++)
            newPiece.vectors.push([piece.vectors[i][0],piece.vectors[i][1]]);
 
        return newPiece;
    }
    rotateRight(piece){
        for(let i = 0; i < piece.vectors.length; i++)
        {
            const temp = piece.vectors[i][1]*-1;
            piece.vectors[i][1] = piece.vectors[i][0];
            piece.vectors[i][0] = temp;
        }
    }
    isClear(piece)
    {
        for(let i = 0; i < piece.vectors.length; i++)
        {
            const point = [piece.vectors[i][0]+piece.center[0], piece.vectors[i][1]+piece.center[1]];
            if(this.field[point[0] + point[1]*this.w].color != "#000000")
            {
                return false;
            }
        }
        return true;
    }
    onMouseMove(event)
    {
        if(!this.active){
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX-rect.left;
        this.mousePos.y = event.clientY-rect.top;
        }
    }
    onKeyPress(event)
    {
        console.log(event.keyCode);
        if(event.code === "Space")
        {
            this.clear(this.livePiece);
            while(this.isClearBelow(this.livePiece))
                this.livePiece.center[1]++;
            this.place(this.livePiece);
            this.livePiece = this.pieceQueue.pop();
            this.pieceQueue.push(this.genRandomNewPiece());
            this.livePiece.center = [this.w/2, 1];
            this.place(this.livePiece);
        }
        else if((event.code === "KeyW" || event.keyCode === 38) && this.livePiece.type != "o")
        {
            this.clear(this.livePiece);
            const newPiece = this.clonePiece(this.livePiece);
            this.rotateRight(newPiece);
            if(this.isClearTranslated(newPiece,[0,0])){
                this.livePiece = newPiece;
            }
            this.place(this.livePiece);
        }
        else if(event.code === "KeyA" || event.keyCode === 37)
        {
            this.clear(this.livePiece);
            if(this.isClearTranslated(this.livePiece, [-1,0]))
                this.livePiece.center[0]--;
            this.place(this.livePiece);
        }
        else if(event.code === "KeyD" || event.keyCode === 39)
        {
            this.clear(this.livePiece);
            if(this.isClearTranslated(this.livePiece, [1,0]))
                this.livePiece.center[0]++;
            this.place(this.livePiece);
        }
        else if(event.code === "KeyS" || event.keyCode === 40)
        {
            this.clear(this.livePiece);
            if(this.isClearTranslated(this.livePiece, [0,1]))
                this.livePiece.center[1]++;
            this.place(this.livePiece);
        }
        else if(event.code == "KeyE")
        {
            this.clear(this.livePiece);
            const type = this.livePiece.type;
            let old = this.pieceTypes.find(el => el.type === type);
            old.center = [this.w/2, 1];
            if(this.holdPiece)
            {
                this.livePiece = this.holdPiece;
            }
            else
            {
                this.livePiece = this.pieceQueue.pop();
                this.pieceQueue.push(this.genRandomNewPiece());
            }
            this.holdPiece = old;
            this.place(this.livePiece);
        }
        else if(event.code === "Key")
        {

        }
    }
    clear(piece)
    {
        for(let i = 0; i < piece.vectors.length; i++)
        {
            const point = [piece.vectors[i][0]+piece.center[0], piece.vectors[i][1]+piece.center[1]];
            this.field[point[0] + point[1]*this.w].color = "#000000";
        }
    }
    isClearTranslated(piece, vector)
    {
        const center = [piece.center[0]+vector[0], piece.center[1]+vector[1]];
        for(let i = 0; i < piece.vectors.length; i++)
        {
            const point = [piece.vectors[i][0]+center[0], piece.vectors[i][1]+center[1]];
            if(point[1] >= this.h || point[0] < 0 || point[0] >= this.w)
                return false;
            else if(this.field[point[0] + point[1]*this.w].color != "#000000")
                return false;
        }
        return true;
    }
    isClearBelow(piece)
    {
        return this.isClearTranslated(piece, [0,1]);
    }
    gameOver()
    {
        this.level = 0;
        this.score = 0;
        for(let i = 0; i < this.pieceQueue.length; i++)
            this.pieceQueue[i] = this.genRandomNewPiece();
        for(let i = 0; i < this.field.length; i++)
            this.field[i].color = "#000000";
    }
    getFilledRows()
    {
        const arr = [];
        for(let y = 0; y < this.h; y++)
        {
            let full = true;
            for(let x = 0;full && x < this.w; x++)
            {
                full = this.field[x + y*this.w].color != "#000000";
            }
            if(full)
                arr.push(y);
        }
        return arr;
    }
    placeField(data)
    {
        data.vectors.forEach(el => {
            const x = data.center[0]+el[0];
            const y = data.center[1]+el[1];
            this.field[x + y*this.w].color = el[2];
        });
    }
    clearFilled()
    {
        const filled = this.getFilledRows();
        const topOfField = [];
        topOfField.length = this.w*this.h;
        for(let y = 0; y  < this.h; y++)
        {
            for(let x = 0; x < this.w; x++)
                if(this.field[x + y*this.w].color != "#000000")  {
                    topOfField.push([x,y, this.field[x + y*this.w].color]);
                }

        }
        const activated = {type:"field",center:[0,0], vectors:topOfField};
        for(let y = 0; y < this.h; y++)
        {
            for(let x = 0; x < this.w; x++)
                this.field[x + y*this.w].color = "#000000";
        }
        for(let i = 0; i < filled.length; i ++)
        {
            const rowNum = filled[i];
            //remove vectors with y value matching filled row index
            activated.vectors = activated.vectors.filter( function(item, idx) {
                return item[1] != rowNum;
            });
            //add one to all the vectors with a y mag greater than the filled row by one
            for(let i = 0; i < activated.vectors.length;i++){
                if(activated.vectors[i][1] < rowNum)
                    activated.vectors[i][1]++;
            };
        }
        this.placeField(activated);
        return filled.length;
    }
    placeAny(piece, field, w)
    {
        for(let i = 0; i < piece.vectors.length; i++)
        {
            const point = [piece.vectors[i][0]+piece.center[0], piece.vectors[i][1]+piece.center[1]];
            //console.log(point[0] + point[1]*this.w);
            if(point[0] + point[1]*w < field.length)
                field[point[0] + point[1]*w].color = piece.color;
        }
    }
    place(piece)
    {
        this.placeAny(piece, this.field, this.w);
    }
    calcMaxScore(level)
    {
        return 40 * (level + 1)	+ 100 * (level + 1) + 300 * (level + 1) + 1200 * (level + 1);
    }
    update()
    {
        this.clear(this.livePiece);
        const rowsCleared = this.clearFilled();
        if(rowsCleared >= 4)
        {
            this.score += 800 + 400*(this.lastRowsCleared>=4);
        }
        else
        {
            this.score += 100*rowsCleared;
        }
        while(this.calcMaxScore(this.level) < this.score && this.level < this.maxLevel)
        {
            this.level++;
        }
        if(this.isClearBelow(this.livePiece))
        {
            this.livePiece.center[1] += 1;
            this.place(this.livePiece);
        }
        else
        {
            this.place(this.livePiece);
            this.livePiece = this.pieceQueue.pop();
            this.livePiece.center = [this.w/2, 1];
            this.pieceQueue.push(this.genRandomNewPiece());
            const topRow = {type:"none", center:[0,0],vectors:[],color:"#000000"};
            for(let i = 0; i < this.w; i++)
            {
                topRow.vectors.push([i,0]);
            }
            if(!this.isClear(topRow))
            {
                this.gameOver();
            }
        }
        if(this.livePiece)
            this.place(this.livePiece);
        
        this.lastRowsCleared = rowsCleared;
    }
    
    draw()
    {
        let width = this.boundedWidth/this.w;
        let height = this.boundedHeight/this.h;
        for(let y = 0; y < this.h; y++)
        {
            for(let x = 0; x < this.w; x++)
            {
                const color = this.field[x + y*this.w].color;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x*width, y*height, width, height);
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(x*width, y*height, width, height);
                if(color != "#000000")
                    this.ctx.strokeRect(x*width+width/4, y*height+height/4, width/2, height/2);
            }
        }
        width -= width/3;
        height -= height/3;
        const hoffset = 155;
        this.ctx.font = '16px Calibri';
        this.ctx.fillStyle = "#000000";
        this.ctx.fillText('Hold Piece:', 5+this.boundedWidth, 15);
        this.ctx.fillText('Score: '+this.score, 5+this.boundedWidth, 15+height*6.8);
        this.ctx.fillText('Level: '+this.level, 5+this.boundedWidth, 15+height*6.8+20);
        for(let i = 0; i < this.pieceQueue.length && i < 5; i++)
        {
            let field = [];
            for(let j = 0; j < 25; j++)
                field.push({color:"#000000"});
            const piece = {type:this.pieceQueue.get(i).type,center:[2,2], vectors:this.pieceQueue.get(i).vectors, color:this.pieceQueue.get(i).color};
            
            this.placeAny(piece, field, 5);
            for(let y = 0; y < 5; y++)
            {
                for(let x = 0; x < 5; x++)
                {
                    const color = field[x + y*5].color;
                    this.ctx.fillStyle = color;
                    const gx = this.boundedWidth+5+(width)*x;
                    const gy = hoffset+(height*5.2)*i+(height)*y;
                    this.ctx.fillRect(gx, gy, width, height);
                    this.ctx.strokeStyle = "#FFFFFF";
                    this.ctx.strokeRect(gx, gy, width, height);
                    if(color != "#000000")
                        this.ctx.strokeRect(gx+width/4, gy+height/4, width/2, height/2);
                }
            }

        }
        if(this.holdPiece)
        {
            let field = [];
            for(let j = 0; j < 25; j++)
                field.push({color:"#000000"});
            const piece = {type:this.holdPiece.type,center:[2,2], vectors:this.holdPiece.vectors, color:this.holdPiece.color};
            
            this.placeAny(piece, field, 5);
            for(let y = 0; y < 5; y++)
            {
                for(let x = 0; x < 5; x++)
                {
                    const color = field[x + y*5].color;
                    this.ctx.fillStyle = color;
                    const gx = this.boundedWidth+5+(width)*x;
                    const gy = 30+(height)*y;
                    this.ctx.fillRect(gx, gy, width, height);
                    this.ctx.strokeStyle = "#FFFFFF";
                    this.ctx.strokeRect(gx, gy, width, height);
                    if(color != "#000000")
                        this.ctx.strokeRect(gx+width/4, gy+height/4, width/2, height/2);
                }
            }
        }
        
    }
};
async function main()
{
   
    const canvas = document.getElementById("screen");
    const ctx = canvas.getContext("2d");
    const gridDim = 4
    
    ctx.fillStyle = "#FF0000";
    let x = 0
    //let f = Field(lines, canvas.width, gridDim, ctx)
    dim = canvas.width;
    let f = new Field(canvas, ctx, 15);
    canvas.addEventListener("click", (event) => f.onClickField(event) );
    canvas.addEventListener("mousemove",(event) => f.onMouseMove(event) );
    window.addEventListener('keydown', function(e) {
        if((e.keyCode == 32 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) && e.target == document.body) {
          e.preventDefault();
          f.onKeyPress(e)
        }
        else
        {
            f.onKeyPress(e);
        }
      });
    //document.getElementById("undo").addEventListener("click", (event) => f.deleteLast())
    let count = 0;
    while(true){
        await sleep(30);
        count++;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.fillStyle = "#FF0000";
        if(count % (f.maxLevel - f.level) == 0)
            f.update()
        f.draw()
    }
}
main();