/*
*
* Variables
*
*/

/*
* Constant Variables
*/



/*
* Game Information
*/




/*
*
* Functions
*
*/

/*
* Handler Functions
*/

function loadFunction()
{//Page load
  //document.getElementById('testButton').addEventListener('click', testFunction, false);

}

function itemClick(e)
{
/*
  if (e.target !== e.currentTarget)
  {
    var clickedItem = e.target; //Get the cell that was clicked on in the grid
    var id = clickedItem.id;
    
    alert(id);
    
  }*/
  alert(this.id);
  e.stopPropagation();
}


//

$(document).ready(function()
{
/*
* Event Handlers
*/

  $('.itemBox').click(itemBox_Click);
  $('.screenButton').click(screenButton_Click);
  $('.screenButton').mousedown(function(){this.style.borderStyle = 'inset'});
  $('.screenButton').mouseleave(function(){this.style.borderStyle = 'outset'});
  
  
/*
* Initial Setup
*/
  $('.itemBox').data('selected', false);
  $('.itemBox').data('dependents', 0);
  $('.itemBox').data('exclusives', 0);
  
  var items = document.getElementsByClassName('itemBox');
  for (var i = 0; i < items.length; i++)
  {
    if (items[i].id.split('_').length == 3)
    {
      $(items).data('dependentScale', 0);
    }
  }
  
  assignPointData();
  assignConditions();
  assignLimitedItems();
  
  switchScreens('screenIntro');
  
});

/*
* Handler Functions
*/

function screenButton_Click()
{
  switchScreens('screen' + this.innerHTML);
  this.style.borderStyle = 'outset';
}

function itemBox_Click()
{
  if (!checkConditions(this))
    return;
  
  var parentItem = $(this).parent()[0];
  
  if ($(this).data('selected') && $(this).data('dependents') == 0 && checkScale(this))
  {//Deselect
    $(this).data('selected', false)
    this.style.borderColor = 'grey';
    incrementRelationships(this, -1);
    adjustPoints(this, true);
    
    if ($(parentItem).data('limit') > 0)
    {
      console.log('parent limit: ' + $(parentItem).data('limit'));
      $(parentItem).data('limitItems', $(parentItem).data('limitItems') - 1);
      console.log($(parentItem).data('limitItems'));
    }
  }
  else if ($(this).data('exclusives') == 0 && checkLimitedStatus(this))
  {//Select
    $(this).data('selected', true)
    this.style.borderColor = 'lime';
    incrementRelationships(this, 1);
    adjustPoints(this, false);
    
    if ($(parentItem).data('limit') > 0)
      $(parentItem).data('limitItems', $(parentItem).data('limitItems') + 1);
  }
}


/*
* Setup
*/

function assignPointData()
{
  var items = $('.itemBox');
  $('#boxPoints').data('points', 0);
  $('#boxMonths').data('months', 24);
  document.getElementById('boxPoints').innerHTML = $('#boxPoints').data('points');
  document.getElementById('boxMonths').innerHTML = $('#boxMonths').data('months');
  
  for (var i = 0; i < items.length; i++)
  {
    var pointString = $(items[i]).find('.points').html();
    if (typeof pointString !== 'undefined')
    {
      $(items[i]).data('pointModifier', parseInt(pointString));
      writePoints(items[i]);
    }
    else
    {
      $(items[i]).data('pointModifier', 0);
    }
    
    var monthString = $(items[i]).find('.months').html();
    if (typeof monthString !== 'undefined')
    {
      $(items[i]).data('monthModifier', parseInt(monthString));
      writeMonths(items[i]);
    }
    else
    {
      $(items[i]).data('monthModifier', 0);
    }
  }
}

function writePoints(item)
{
  var points = Math.abs($(item).data('pointModifier'));
  
  if ($(item).data('pointModifier') < 0)
    item.getElementsByClassName('points')[0].innerHTML = 'Costs ' + points + ' points';
  else
    item.getElementsByClassName('points')[0].innerHTML = 'Gain ' + points + ' points';
  
  if (points == 1)
  {
    var strSingle = item.getElementsByClassName('points')[0].innerHTML.replace('points', 'point');
    item.getElementsByClassName('points')[0].innerHTML = strSingle;
  }
}

function writeMonths(item)
{
  var months = Math.abs($(item).data('monthModifier'));
  
  if ($(item).data('monthModifier') < 0)
    item.getElementsByClassName('months')[0].innerHTML = 'Serve ' + months + ' less months';
  else
    item.getElementsByClassName('months')[0].innerHTML = 'Serve ' + months + ' more months';
  
  if (months == 1)
  {
    var strSingle = item.getElementsByClassName('months')[0].innerHTML.replace('months', 'month');
    item.getElementsByClassName('months')[0].innerHTML = strSingle;
  }
}

function assignConditions()
{
  var items = $('.itemBox');
  
  for (var i = 0; i < items.length; i++)
  {
    var currentItem = $(items[i]);
    
    var requirements = currentItem.find('.itemRequirement').html();
    var restrictions = currentItem.find('.itemRestriction').html();
    
    if (typeof requirements !== 'undefined')
    {
      var reqArray = requirements.split(', ');
      currentItem.data('requiredItems', reqArray);
      currentItem.find('.itemRequirement').html(writeConditions(reqArray, 'Requires '));
    }
    else
      currentItem.data('requiredItems', []);
    
    if (typeof restrictions !== 'undefined')
    {
      var resArray = restrictions.split(', ');
      currentItem.data('restrictedItems', resArray);
      currentItem.find('.itemRestriction').html(writeConditions(resArray, 'Cannot be taken with '));
    }
    else
      currentItem.data('restrictedItems', []);
  }
}

function writeConditions(writeArray, startString)
{;
  if (writeArray[0] == '')
  {//Arrays are not empty, even if there are no conditions, they have an empty element
    return '';
  }
  
  var retString = startString;
  
  for (var i = 0; i < writeArray.length; i++)
  {
    if (writeArray[i].split('_').length == 3)
      retString += 'at least ' + document.getElementById(writeArray[i]).getElementsByClassName('itemName')[0].innerHTML + ' (' + writeArray[i].split('_')[0].replace('item', '') + ')';
    else
      retString += document.getElementById(writeArray[i]).getElementsByClassName('itemName')[0].innerHTML;
    
    if (i + 2 == writeArray.length)
    {
      retString += ' and ';
    }
    else if (i + 1 < writeArray.length)
    {
      retString += ', ';
    }
  }
  
  return retString;
}

function assignLimitedItems()
{
  var trays = $('.itemTray');
  
  for (var i = 0; i < trays.length; i++)
  {
    //console.log(trays[i]);
    $(trays[i]).data('limit');
    
    $(trays[i]).data('limitItems', 0);
    //console.log($(trays[i]).data('limit'));
    
    var items = $(trays[i]).find('.itemBox');
    for (var j = 0; j < items.length; j++)
    {
      //console.log(items[j]);
      $(items[j]).data('limited', true);
    }
  }
}

function switchScreens(newScreen)
{
  var screens = $('.screen')
  
  for (var i = 0; i < screens.length; i++)
  {
    screens[i].style.display = 'none';
  }
  
  document.getElementById(newScreen).style.display = 'inline-block';
}

/*
* Things
*/

function checkConditions(item)
{
  var reqArray = $(item).data('requiredItems');
  var resArray = $(item).data('restrictedItems');
  
  if (reqArray[0] != '')
    if (!checkArrayConditions(reqArray, true))
      return false;
  
  if (resArray[0] != '')
    if (!checkArrayConditions(resArray, false))
      return false;
  
  return true;
}

function checkArrayConditions(conditionArray, comparison)
{
  for (var i = 0;i < conditionArray.length; i++)
  {//For each conditional item
    var conditionalItem = document.getElementById(conditionArray[i]);
    
    if (conditionalItem.id.split('_').length == 3)
    {
      var parentItem = $(conditionalItem).parent()[0];
      //console.log(parentItem);
      var siblingItems = parentItem.getElementsByClassName('itemBox');
      //console.log(siblingItems);
      
      var hit= false;
      for (var j = 0; j < siblingItems.length; j++)
      {
        var value = parseInt(siblingItems[j].id.split('_')[1]);
        
        if ($(siblingItems[j]).data('selected') == comparison && value >= parseInt(conditionalItem.id.split('_')[1]))
          hit = true;
      }
      if (hit)
        continue;
    }
    
    if ($(conditionalItem).data('selected') != comparison)
      return false;
    
  }
  return true;
}

function incrementRelationships(item, value)
{
  var reqArray = $(item).data('requiredItems');
  var resArray = $(item).data('restrictedItems');
  
  if (reqArray[0] != '')
    incrementDataForArray(reqArray, 'dependents', value)
  if (resArray[0] != '')
    incrementDataForArray(resArray, 'exclusives', value)
}

function incrementDataForArray(dataArray, itemData, value)
{
  for (var i = 0; i < dataArray.length; i++)
  {
    //var item = $('#' + dataArray[i]);
    //item.data(itemData, item.data(itemData) + value);
    
    var item = document.getElementById(dataArray[i]);
    
    if(item.id.split('_').length == 3)
    {
      console.log(item.id);
      var parent = $(item).parent()[0];
      var siblingItems = parent.getElementsByClassName('itemBox');
      for (var j = 0; j < siblingItems.length; j++)
      {
        console.log(j);
        if (parseInt(siblingItems[j].id.split('_')[1]) >= parseInt(item.id.split('_')[1]))
        {
          $(siblingItems[j]).data('dependentScale', $(siblingItems[j]).data('dependentScale') + value)
        }
        //siblingItems[j].getElementsByClassName('testOutput')[0].innerHTML = $(siblingItems[j]).data('dependentScale');
      }
    }
    else
    {
      $(item).data(itemData, $(item).data(itemData) + value);
    }
    //console.log(dataArray[i] + "'s " + itemData + ' is ' + $(item).data(itemData));
  }
}

function checkLimitedStatus(item)
{
  var parentItem = $(item).parent()[0];
  
  if (typeof $(parentItem).data('limit') == 'undefined')
    return true;
  
  if ($(parentItem).data('limitItems') < $(parentItem).data('limit'))
    return true;
}

function checkScale(item)
{
  
  if (item.id.split('_').length != 3)
    return true;
  
  if ($(item).data('dependentScale') == 0)
    return true;
  
  var parentItem = $(item).parent()[0];
  var siblingItems = parentItem.getElementsByClassName('itemBox');
  var itemMagnitude =  parseInt(item.id.split('_')[1])
  
  for (var j = 0; j < siblingItems.length; j++)
  {
    var siblingMagnitude = parseInt(siblingItems[j].id.split('_')[1])
    
    if ($(siblingItems[j]).data('selected'))
    {
      if (siblingMagnitude > itemMagnitude)
        return true;
      if (siblingMagnitude < itemMagnitude && $(siblingItems[j]).data('dependentScale') >= $(item).data('dependentScale'))
        return true;
    }
      
  }
}

function adjustPoints(item, deselect)
{
  var pointModifier = $(item).data('pointModifier');
  var monthModifier = $(item).data('monthModifier');
  
  if (deselect)
  {
    pointModifier = -pointModifier;
    monthModifier = -monthModifier;
  }
  
  $('#boxPoints').data('points', $('#boxPoints').data('points') + pointModifier);
  $('#boxMonths').data('months', $('#boxMonths').data('months') + monthModifier);
  document.getElementById('boxPoints').innerHTML = $('#boxPoints').data('points');
  document.getElementById('boxMonths').innerHTML = $('#boxMonths').data('months');
}







