(function($) {

    var tb = [
        [{ header: [1, 2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'code'],
          [{list: 'ordered'}, {list: 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image', 'code-block'],
          ['clean']
    ];

    var quillify = function(){
        var editor = $('<div>'),
            container = $('<div style="float: left; width: 80%">').append(editor),
            textarea = $(this),
            q;

        textarea.parent().append(container);
        textarea.hide();

        q = new Quill(
            editor.get(0),
            {
                modules: {
                    toolbar: tb,
                },
                theme: 'snow'
            }
        );
        q.pasteHTML(textarea.val());
        q.on('text-change', function(delta, oldDelta, source){
            var content = editor.find('.ql-editor').html();
            textarea.val(content);
        });
    };

    $(document).ready(function(){
        $('textarea').parent().parent().css({'min-height': '250px'});
        $('textarea').each(quillify);
    });

})(django.jQuery);
