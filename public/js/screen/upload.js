async function getBase64(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = function (error) {
            reject(error);
        };
    });
}

function getFormat(fileName) {
    var extension = fileName.substr( (fileName.lastIndexOf('.') +1) );
   return extension;
};

$(document).ready(function () {

    const uploadClick = async function () {
        //
        // if (!$('#songName').val()) {
        //     swal({
        //         type: 'error',
        //         title: 'Oops...',
        //         text: '請輸入歌名',
        //     })
        //     return;
        // }
        //
        // if (!$('#userName').val()) {
        //     swal({
        //         type: 'error',
        //         title: 'Oops...',
        //         text: '請輸入使用者名稱',
        //     })
        //     return;
        // }
        //
        // if (!$('#audioFile').get(0).files[0]) {
        //     swal({
        //         type: 'error',
        //         title: 'Oops...',
        //         text: '請上傳詩歌',
        //     })
        //     return;
        // }

        // $.blockUI({message: '<h1><img src="http://res.cloudinary.com/uecare/image/upload/v1531128438/oriact/Spinner-1s-200px.gif" /> <br>資料上傳中...</h1>'});

        let audioFileBase64 = await getBase64($('#audioFile').get(0).files[0]);
        let audioFileFileName = $('#audioFile').get(0).files[0].name;
        let fileFormat = getFormat(audioFileFileName);
        let songName = $('#songName').val();
        let userName = $('#userName').val();

        let obj = {
            songName,
            userName,
            audioFileBase64,
            audioFileFileName,
            fileFormat
        };

        console.log(fileFormat);

        $.ajax({
            type: 'POST',
            url: 'upload',
            data: JSON.stringify(obj),
            contentType: 'application/json',
            success: function (xhr) {
                console.log('xhr=', xhr);
                swal(
                    "成功!",
                    "上傳成功！",
                    "success"
                )

                // $.unblockUI();
            },
            error: function (err) {
                console.log('err=', err);
                swal(
                    "上傳失敗！",
                    err.responseJSON.message,
                    "error"
                );
                // $.unblockUI();
            }
        });

    };

    //load machine data
    $('#upload').click(async function () {

        uploadClick().then().catch(function (err) {
            swal({
                title: "上傳失敗!",
                text: err.message,
                type: "error"
            });
            // $.unblockUI();
        });
    });
});
