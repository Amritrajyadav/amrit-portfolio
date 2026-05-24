let playing=false;
let score;
let timeremaining;
let action;
let correctanswer;
//if we click on start game button
document.getElementById("startreset").onclick=function()
{
    //if we are palying
    if(playing==true)
    {
        location.reload();//reload the page
    }
    else
    {
        //if we are not playing
        //change the mode to playing
        playing=true;
        score=0;
        document.getElementById("scorevalue").innerHTML=score;
        //show the countdown box
        show("timeremaining");
        timeremaining=60;
        document.getElementById("trvalue").innerHTML=timeremaining;
        //to change buton to reset game
        document.getElementById("startreset").innerHTML="Reset Game"; 
        //show countdown box 
        showCountDown();
        //genrate new QA
        genrateQA();
    }
}
//show function and hide functions
function show(id)
{
    document.getElementById(id).style.display="block";
}
function hide(id)
{
    document.getElementById(id).style.display="none";
}
//function for countdown stopCoundown
function showCountDown()
{
    action=setInterval(function(){
        timeremaining--;
        document.getElementById("trvalue").innerHTML=timeremaining;
        if(timeremaining==0)
        {
            //gave overflow: 
            stopCountDown();
            show("gameover");
            document.getElementById("gameover").innerHTML=`
            <p>Game Over!</p>
            <p>Your Score is  ${score}</p
            `;
            hide("timeremaining")
            hide("correct");
            hide("wrong");
            playing=false;
            document.getElementById("startreset").innerHTML="Start Game";
        }
    },1000);
}
function stopCountDown()
{
    clearInterval(action);
}
//function for genrating QA
function genrateQA()
{
    let x= 1+Math.floor(9*Math.random());
    let y= 1+Math.floor(9*Math.random());
    correctanswer=x * y;
    document.getElementById("question").innerHTML=x + "x" +y;
    let correctposition=1+Math.round(3 * Math.random());
    //fill the correct box
    document.getElementById("box" + correctposition).innerHTML=correctanswer;
    //fill wrong boxes 
    var answer=[correctanswer];
    for(i=1;i<5;i++)
    {
        if(i !=correctposition)
        {
            let wronganswer;
            do
            {
                wronganswer=(1+Math.floor(9*Math.random())) * (1+Math.floor(9*Math.random()));
            }while(answer.indexOf(wronganswer) >-1);
            answer.push(wronganswer);
            document.getElementById("box" + i).innerHTML=wronganswer;
        }
    }
}
//if we click on answer box
for (i = 1; i < 5; i++) {
    document.getElementById('box' + i).onclick = function() 
    {
        //if we are playing
        if (playing == true) //yes
        {
            if (this.innerHTML == correctanswer) //correct answer
            {
                //yes
                //increase score
                score++;
                document.getElementById('scorevalue').innerHTML = score;
                //show correct box for sec and hide wrong box
                hide('wrong');
                show('correct');
                setTimeout(function() {
                        hide('correct');
                    }, 1000)
                    //genreate QA
                genrateQA();
            } else {
                //wrong answer
                hide('correct');
                show('wrong');
                setTimeout(function() {
                    hide('wrong');
                }, 1000)
            }
        }
    }

}
