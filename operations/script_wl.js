var productsdiv=document.querySelectorAll(".card")
var myModal=document.getElementById("myModal")
var close=document.querySelectorAll(".close")
var showmore=document.querySelectorAll(".showmore")
var modal=document.querySelectorAll(".modal")


productsdiv.forEach(function(data,index){
  identity="productdiv"+index
  data.setAttribute("id",identity)
  showmore[index].setAttribute("id","showmore"+index)
  modal[index].setAttribute("id","modal"+index)
  close[index].setAttribute("id","close"+index)
  
  var demomodal=document.getElementById("modal"+index)
  var democlose=document.getElementById("close"+index)
  
  var demoshow=document.getElementById("showmore"+index)
  demoshow.onclick=function(){
    demomodal.style.display = "block";
  }
  democlose.onclick=function(){
    demomodal.style.display="none";
  }
})

