$(document).ready(function() {
  $(':checkbox').on('click', changeTodoStatus);
});

function changeTodoStatus() {
  var todoId = $(this).data('todo-id');
  var todoDescription = $(this).siblings('.todo-description').text();
  if ($(this).is(':checked')) {
    putNewStatus(todoId, true, todoDescription);
  } else {
    putNewStatus(todoId, false, todoDescription);
  }
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

function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toastContainer');
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  if (type === 'success') {
    toast.style.background = '#5cb85c';
  } else if (type === 'info') {
    toast.style.background = '#5bc0de';
  }

  container.appendChild(toast);

  // Trigger animation
  setTimeout(function() {
    toast.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(function() {
    toast.classList.add('hide');
    setTimeout(function() {
      container.removeChild(toast);
    }, 300);
  }, 3000);
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
          var duration = response.duration || '未知时间';
          showToast('恭喜！完成任务: "' + todoDescription + '"，用时: ' + duration, 'success');
        } else {
          showToast('任务已重新打开: "' + todoDescription + '"', 'info');
        }
        // Delay reload to show toast
        setTimeout(function() {
          location.reload();
        }, 1500);
      }
    });
  });
}
