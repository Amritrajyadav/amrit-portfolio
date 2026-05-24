$(()=>
{
    let endDate=new Date().getTime() + 1000500000;
    let x=setInterval(()=>
    {
        let now=new Date().getTime();
        let timeR=endDate-now;
        let dR=Math.floor(timeR/(1000*60*60*24));
        let hR=Math.floor(timeR%(1000*60*60*24)/(1000*60*60));
        let mR=Math.floor(timeR%(1000*60*60)/(1000*60));
        let sR=Math.floor(timeR%(1000*60)/(1000));
        $("#days").html(dR);
        $("#hours").html(hR);
        $("#minutes").html(mR);
        $("#seconds").html(sR);
        if(timeR<0)
        {
            clearInterval(x);
            $("#days").html("0");
            $("#hours").html("0");
            $("#minutes").html("0");
            $("#seconds").html("0");
        }
    },1000)
});