<template>
    <section class="uploadimg">
        <el-dialog :close-on-click-modal="false" title="裁切图片" :visible.sync="isCropper" size="large" top="200px" class="cropper" width="800px" @close="closeCropper" >
            <div class="croppercontainer">
                <img @load="startCropper" ref="currentImg" class="image_preview" :src="imgData" />
            </div>
            <span slot="footer" class="dialog-footer">
                <span class="size">当前尺寸：{{ tailorW }}*{{ tailorH }}</span>
                <el-button @click="isCropper = false">取 消</el-button>
                <el-button type="primary" @click="confirmCropper" :loading="isLoading" >确 定</el-button>
            </span>
        </el-dialog>
        <input accept="image/jpg,image/jpeg,image/png,image/gif" type="file" style="display: none" @change="fileChange($event)" ref="file" />
    </section>
</template>

<script>
//两种方法挂载静态资源
//1. 挂载的静态资源是通过express完成的
//2. CopyWebpackPlugin 用来拷贝第三方js放到打包后配置的目录
//gif.worker.js 是不需要经过webpack进行打包的

import Cropper from "cropperjs";
import "../../node_modules/cropperjs/dist/cropper.min.css";
import GIF from "gif.js";
import GifToCanvas from "../../static/js/gifToCanvas";
import Toast from "assets/js/Toast";
export default {
    props: {
        finalRatio: Number, //截取框的比例
        isNoCropper: Number, //是否需要截取框  1需要,0不需要
    },
    data() {
        return {
            headers: {},
			cropper: '',
            isCropper: false,
            imgData: "",
            tailorW: 0,
            tailorH: 0,
            imageType: "",
            isLoading: false,
            gif: "",
        };
    },
    created() {
        // this.headers = {
        //     'Token': localStorage.getItem('token')
        // }
    },

    methods: {
        //上传图片
        chooseImg() {
            if (this.type) {
            }
            this.$refs.file.click();
        },
        //监听图片变化
        fileChange(e) {
            let t = this,
                file = e.target.files[0],
                reader = new FileReader();
            if (!file) return;
            //判断是否使用图片截取框
            if (this.isNoCropper) {
                //不需要截取框
                this.UpLoadNoCropper(file);
            } else {
                reader.readAsDataURL(file);
                reader.onload = function (img) {
                    t.$nextTick(() => {
                        t.imgData = this.result;
                        t.$refs.file.value = null;
                        t.isCropper = true;
                        t.imageType = file.type;
                    });
                };
            }
        },
		blobToDataURL(blob){
			return new Promise((resolve, reject) => {
				let reader = new FileReader();
				reader.onload = function(evt){
					resolve(evt.target.result)
				};
				reader.readAsDataURL(blob);
			})
		},
        UpLoadNoCropper(file) {
			this.blobToDataURL(file).then((res) => {
				this.$emit("getImgUrl", URL.createObjectURL(this.dataURLtoBlob(res)));
			})
			// this.blobToDataURL(file, (base64) => {
			// 	console.log(base64);
			// })
			// console.log(file);
            // let t = this,
            //     params = new FormData();
            // if (!file) return Toast.MessageInfo("请选择图片", "error");
            // params.append("file", file);
			// this.$emit("getImgUrl", window.URL.createObjectURL(blob));
        },

        startCropper() {
            let t = this,
                image = t.$refs.currentImg;
            t.cropper = new Cropper(image, {
                aspectRatio: t.finalRatio || 4 / 3,
                scalable: false,
                zoomable: false,
                viewMode: 1,
                crop(e) {
                    t.tailorW = Math.round(e.detail.width);
                    t.tailorH = Math.round(e.detail.height);
                },
            });
        },

        //确定裁剪上传
        confirmCropper() {
            this.isLoading = true
            if (this.imageType == "image/gif") {
                this.gifFn();
            } else {
                this.pngFn();
            }
        },
        //gif截取方法
        gifFn() {
            let t = this,
                url = URL.createObjectURL(this.dataURLtoBlob(t.cropper.url)),
                cropBoxData = this.cropper.getCropBoxData(), //截取框
                canvasData = this.cropper.getCanvasData(); //图片
            this.gifToCanvas = new GifToCanvas(url, {
                targetOffset: {
                    dx: cropBoxData.left - canvasData.left,
                    dy: cropBoxData.top - canvasData.top,
                    width: canvasData.naturalWidth,
                    height: canvasData.naturalHeight,
                    sWidth: cropBoxData.width,
                    sHeight: cropBoxData.height,
                },
            });
            //canvas到gif
            this.gif = new GIF({
                workers: 4,
                quality: 10,
                width: cropBoxData.width,
                height: cropBoxData.height,
                workerScript: `/static/js/gif.worker.js`,
            });
            const addFrame = (canvas, delay) => {
                this.gif.addFrame(canvas, { copy: true, delay });
            };
            //监听每一帧变化，收集每一帧的变化
            this.gifToCanvas.on("progress", (canvas, delay) => {
                console.log("---------");
                console.log(delay);
                addFrame(canvas, delay);
            });
            //完成进行渲染
            this.gifToCanvas.on("finished", (canvas, delay) => {
                addFrame(canvas, delay);
                this.gif.render();
            });
            this.gif.on("finished", (blob) => {
                this.$emit("getImgUrl", window.URL.createObjectURL(blob));
				Toast.MessageInfo("图片上传成功", "success", 4000);
				this.isCropper = false
				this.isLoading = false
                return;
            });
            this.gifToCanvas.init();
        },
        //png/jpg截取方法
        pngFn() {
			//将base64转化为blob再将其转为file
			let t =this,
				coverBase64 = t.cropper.getCroppedCanvas().toDataURL(`${t.imageType}`, 0.94),
				//实际调试接口中一般用的文件格式，这会相当于一个例子
			  	cover = new window.File([t.dataURLtoBlob(coverBase64)], "img.jpg", { type: t.imageType }); 
				this.$emit("getImgUrl", URL.createObjectURL(this.dataURLtoBlob(coverBase64)))
				Toast.MessageInfo("图片上传成功", "success", 4000)
				this.isCropper = false
				this.isLoading = false
                return;
		},

        // 关闭裁剪需要销毁要不然第二次裁剪显示的是第一次的图片
        closeCropper() {
            this.cropper.destroy();
            this.imgData = "";
        },
        dataURLtoBlob(dataurl) {
            var arr = dataurl.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {
                type: mime,
            });
        },
    },
};
</script>

<style lang="scss">
.size {
    color: #f56c6c;
    font-size: 14px;
    margin-right: 24px;
}
</style>