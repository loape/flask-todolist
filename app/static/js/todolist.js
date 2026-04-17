$(document).ready(function() {
  $(':checkbox').on('click', changeTodoStatus);
});

function showToast(message, type = 'success') {
  var toast = $('#toast');
  toast.text(message);
  toast.addClass('show ' + type);
  setTimeout(function() {
    toast.removeClass('show ' + type);
  }, 3000);
}

function changeTodoStatus() {
  var checkbox = $(this);
  var todoDescription = checkbox.siblings('.todo-description').text();
  var isFinished = checkbox.is(':checked');
  
  putNewStatus(checkbox.data('todo-id'), isFinished, todoDescription);
}

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// function from the django docs
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie != '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) == (name + '=')) {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        );
        break;
      }
    }
  }
  return cookieValue;
}

function putNewStatus(todoID, isFinished, todoDescription) {

  // setup ajax to csrf token
  var csrftoken = getCookie('csrftoken');
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    }
  });
  // send put request using the todo of the get for the same id
  var todoURL = '/api/todo/' + todoID + '/'
  $.getJSON(todoURL, function(todo) {
    todo.is_finished = isFinished;
    $.ajax({
      url: todoURL,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(todo),
      success: function(response) {
        if (isFinished) {
          var timeMessage = response.time_spent ? '，用时: ' + response.time_spent : '';
          showToast('🎉 太棒了！完成任务: ' + todoDescription + timeMessage, 'success');
        } else {
          showToast('📝 已重新打开任务: ' + todoDescription, 'info');
        }
        setTimeout(function() {
          location.reload();
        }, 1000);
      },
      error: function() {
        showToast('❌ 操作失败，请重试', 'error');
        location.reload();
      }
    });
  });
}
