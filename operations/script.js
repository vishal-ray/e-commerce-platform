var productsdiv=document.querySelectorAll(".card")
var myModal=document.getElementById("myModal")
var close=document.querySelectorAll(".close")
var button=document.querySelectorAll(".addtocartbutton")
var showmore=document.querySelectorAll(".showmore")
var modal=document.querySelectorAll(".modal")


productsdiv.forEach(function(data,index){
  identity="productdiv"+index
  data.setAttribute("id",identity)
  button[index].setAttribute("id","button"+index)
  showmore[index].setAttribute("id","showmore"+index)
  modal[index].setAttribute("id","modal"+index)
  close[index].setAttribute("id","close"+index)
  
  var demomodal=document.getElementById("modal"+index)
  var democlose=document.getElementById("close"+index)

  var demobutton=document.getElementById("button"+index)
  demobutton.addEventListener("click",function(){

  demobutton.innerText="Added To Cart";
  demobutton.style.backgroundColor="red";
  demobutton.style.color="white";
  })
  var demoshow=document.getElementById("showmore"+index)
  demoshow.onclick=function(){
    demomodal.style.display = "block";
  }
  democlose.onclick=function(){
    demomodal.style.display="none";
  }
})

