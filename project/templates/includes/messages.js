<script type="text/javascript">
    toastr.options = {
        closeButton: true,
        newestOnTop: true,
        positionClass: 'toast-top-right',
        showDuration: 500,
        hideDuration: 500,
        timeOut: 0,
        extendedTimeOut: 0,
    };

    {% for message in messages %}
        toastr["{{message.tags}}"]("{{ message|safe }}");
    {% endfor %}

    window.setInterval(function(){
        $.get('{% url "analysis:poll_messages" %}', function(d){
            if(d.messages.length>0){
                toastr.clear();
            }
            d.messages.forEach(function(resp){
                toastr[resp.status](resp.message);
            });
        });
    }, 60000);
</script>
