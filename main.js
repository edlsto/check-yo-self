var grid = document.querySelector(".cards");
var allItems = document.querySelectorAll(".card");

grid.addEventListener("resize", resizeAllGridItems);

function resizeGridItem(item){
  rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap+121.4219)/(rowHeight+rowGap));
  item.style.gridRowEnd = "span "+rowSpan;
}

function resizeAllGridItems(){
  for (var i = 0; i < allItems.length; i++) {
    resizeGridItem(allItems[i]);
  }
}
window.onload = setTimeout(function(){
  resizeAllGridItems();
}, 30);
