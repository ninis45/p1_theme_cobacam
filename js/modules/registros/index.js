$(document).ready(function(){
    var input_text = $('.typeahead');
    var alumnos= new Bloodhound({
      //datumTokenizer: Bloodhound.tokenizers.whitespace,
      //queryTokenizer: Bloodhound.tokenizers.whitespace,
      // `states` is an array of state names defined in "The Basics"
       datumTokenizer: Bloodhound.tokenizers.obj.whitespace('nombre'),
       queryTokenizer: Bloodhound.tokenizers.whitespace,
      
       local: data?data:[]
    });
    $('body').delegate('.btn-remove','click',alumno.del);
    $('body').delegate('.btn-edit','click',alumno.edit);
    
    $('#btn-save').on('click',function(){
        
        var btn = $(this);
        
        btn.attr('disabled',true);
    // business logic...
        
       // btn.button('reset');
        $('#form').submit();
        
        
        
    });
    $('#form').on('submit',alumno.save);
    $('#text_auto').typeahead(null,/*{
      hint: true,
      highlight: true,
      minLength: 1
    },*/
    {
      name: 'alumnos',
       display: 'nombre',
      source: alumnos,
      templates: {
          empty: [
            '<div class="empty-message alert">',
              'El alumno no existe o no se encuentra registrado, deseo <a href="javascript:;" id="btn-other">registrarlo</a> de todos modos.',
            '</div>'
          ].join('\n'),
          suggestion: Handlebars.compile('<div><strong>{{nombre}}</strong> <br/> {{matricula}}</div>')
        }
    });
    
     input_text.bind('typeahead:select',alumno.create);
     
     $('body').delegate('#btn-other','click',alumno.create);
     alumno.load();
     
     

    // Add events
    $('input[type=file]').on('change', prepareUpload);
    
    // Grab the files and set them to our variable
    function prepareUpload(event)
    {
       alumno.files = event.target.files;
       readURL(this);
      
    }
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#img-avatar').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    }
});

var alumno = {
    files:false,
    id_evento:false,
    action:'',
    list:$('#list-content'),
    
    create:function(e,suggestion){
        
        
        var action = '/registros/create',
            modal  = $('#modalRegistro');
          
          alumno.action = SITE_URL+'registros/create';  
         alumno.refresh(modal);
         if(suggestion){
            console.log(suggestion);         
            
            input_participante = modal.find('#participante');
            input_matricula = modal.find('#matricula');
            input_participante.val(suggestion.nombre);
            input_matricula.val(suggestion.matricula);
            //$('#modalRegistro .modal-content').load(action);
            
         }
         else
         {
            input_participante = modal.find('#participante');
            input_matricula = modal.find('#matricula');
            input_participante.val($('#text_auto').val());
            input_matricula.val('NA');
         }
        $('#modalRegistro').modal();
    },
    edit:function(e)
    {
        e.preventDefault();
        var anchor = $(this),
               id  =  anchor.data('registro'),
         container = $('#modalRegistro'),
         registro  = registros[id];
               
        alumno.refresh(container);
        
        container.find('#participante').val(registro.participante);
        container.find('#sexo').val(registro.sexo);
        container.find('#matricula').val(registro.module_id);
        container.find('#disciplina').val(registro.id_disciplina);
        container.find('#talla_asesor').val(registro.extra.talla_asesor);
        container.find('#talla_participante').val(registro.extra.talla_participante);
        
        container.find('#telefono_asesor').val(registro.extra.telefono_asesor);
        container.find('#telefono_participante').val(registro.extra.telefono_participante);
        
        container.find('#facebook').val(registro.extra.facebook);
        
        container.find('#descripcion').val(registro.extra.descripcion);
        container.find('#observaciones').val(registro.extra.observaciones);
        
        container.find('#tutor').val(registro.extra.tutor);
        container.find('#asesor').val(registro.extra.asesor);
         
          container.find('#hospedaje_participante').attr('checked',registro.extra.hospedaje_participante==1?true:false).iCheck();
          container.find('#hospedaje_asesor').attr('checked',registro.extra.hospedaje_asesor==1?true:false).iCheck();
          
           container.find('#sexo_asesor').val(registro.extra.sexo_asesor);
          container.find('#img-avatar').attr('src',SITE_URL+'files/cloud_thumb/'+registro.extra.fotografia+'/100/100');
          container.find('#fotografia').val(registro.extra.fotografia);
          
          if(registro.activo=='0')
          {
            $('#notices-modal').html(registro.message);
          }
         $('#modalRegistro').modal();
        
        alumno.action = anchor.attr('href');
        
    },
    del:function(e)
    {
        if(!confirm('¿Confirma eliminar el siguiente registro?'))
        {
            return false;
        }
         var element = $(this),
                  id = element.data('registro');
         $.post('/registros/delete/'+id,{},function(response){
            
            
               location.href = action_redirect;
            
            
            
        });
    },
    save:function(event)
    {
        event.stopPropagation(); // Stop stuff happening
        event.preventDefault(); // Totally stop stuff happening
         
        
        var data = new FormData($(this)[0]);
        if($('#fotografia_tmp')[0].files[0]) data.append('fotografia', $('#fotografia_tmp')[0].files[0]);
         
         
        
         $.ajax({
            url: alumno.action,
            type: 'POST',
            data: data,
            //cache: false,
            //dataType: 'json',
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            enctype: 'multipart/form-data',
            success: function(data, textStatus, jqXHR)
            {
                if(data.status == 'error')
                {
                    $('#notices-modal').html(data.message);
                    $('#btn-save').attr('disabled',false);
                }
                else
                {
                    location.href = action_redirect;
                }
                if(typeof data.error === 'undefined')
                {
                    // Success so call function to process the form
                    //submitForm(event, data);
                }
                else
                {
                    // Handle errors here
                    console.log('ERRORS: ' + data.error);
                }
            },
            error: function(jqXHR, textStatus, errorThrown)
            {
                // Handle errors here
                console.log('ERRORS: ' + textStatus);
                // STOP LOADING SPINNER
            },
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    // For handling the progress of the upload
                    myXhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            $('progress').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                        }
                    } , false);
                }
                return myXhr;
            },
        });
        
    },
    load:function()
    {
       console.log(registros);
        $.each(registros,function(index,suggestion){
            
            
            var content = '<tr><td><img width="40" style="float:left;margin-right:5px;" src="/files/cloud_thumb/'+(suggestion.extra.fotografia?suggestion.extra.fotografia:'dummy')+'"/><input type="hidden" name="alumno['+suggestion.matricula+'][matricula]" value="'+suggestion.matricula+'">'+suggestion.participante+'<br/><span class="text-muted">'+suggestion.module_id+'</span></td><td>'+suggestion.nombre_disciplina+'</td><td>'+suggestion.extra.talla_participante+'</td><td class="text-center">'+(suggestion.extra.hospedaje_participante == 1?'<i class="fa fa-check text-success"></i>':'')+'</td><td> <a target="_blank" href="'+SITE_URL+'registros/download/tutor/'+suggestion.id+'">Tutores</a> | <a target="_blank" href="'+SITE_URL+'registros/download/asesor/'+suggestion.id+'">Docentes</a></td><td><a href="'+SITE_URL+'registros/edit/'+suggestion.id+'" data-registro="'+suggestion.id+'"  class="btn  btn-color-primary btn-small btn-edit'+(suggestion.activo=='1'?'':' disabled')+'"><i class="fa fa-pencil"></i></a>   <a href="javascript:;"  data-registro="'+suggestion.id+'" class="btn  btn-small btn-remove '+(suggestion.activo=='1'?'':' disabled')+'"><i class="fa fa-remove"></i></a></td></tr>';
         
            $('#list-content').append(content);
        });
        
    },
    refresh:function(container)
    {
        container.find('#matricula').val('NA');
         container.find('#sexo').val('');
        container.find('#disciplina').val('');
        container.find('#talla_asesor').val('');
        container.find('#talla_participante').val('');
        
        container.find('#telefono_asesor').val('');
        container.find('#telefono_participante').val('');
        
        container.find('#facebook').val('');
        
        container.find('#descripcion').val('');
        container.find('#observaciones').val('');
        
        container.find('#tutor').val('');
        container.find('#asesor').val('');
        
         container.find('#sexo_asesor').val('');
         
          container.find('#hospedaje_participante').attr('checked',false).iCheck();
          container.find('#hospedaje_asesor').attr('checked',false).iCheck();
          
          
          container.find('#img-avatar').attr('src',SITE_URL+'files/cloud_thumb/0');
          container.find('#fotografia').val('');
          $('#btn-save').attr('disabled',false);
          $('#notices-modal').html('');
    }
    
};
