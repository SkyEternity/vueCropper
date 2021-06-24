<template>
    <section>
        <section class="container">
            <section class="left">
                <el-button type="primary" @click="chooseImg">上传图片</el-button>
                <i class="line"></i>
            </section>
            <section class="right">
                <img :src="imgUrl" v-if="imgUrl" />
            </section>
        </section>
        <UploadImg ref="uploadImg" @getImgUrl="getImgUrl" :isNoCropper="isNoCropper" :finalRatio="finalRatio"></UploadImg>
    </section>
</template>

<script>
import UploadImg from "components/UploadImg";
export default {
    components: {
        UploadImg,
    },
    data() {
        return {
            isNoCropper: 0,
            finalRatio: 4 / 3,
			imgUrl: '',
        };
    },

    created() {
    },
    methods: {
        // 选择图片
        chooseImg() {
            this.$refs.uploadImg.chooseImg();
        },
        getImgUrl(url) {
			this.imgUrl = url
        },
    },
};
</script>

<style lang="scss">
body {
    background: #f8f8f8;
}
.container {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    // box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    border-radius: 4px;
    border: 1px solid #ebeef5;
    width: 800px;
    height: 320px;
    background: #fff;
    .left,
    .right {
        position: relative;
        width: 400px;
        text-align: center;
        .line {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            background: #ebebeb;
            width: 1px;
            height: 260px;
        }
        &:first-of-type {
        }
        img {
            display: block;
            width: 200px;
			height: 150px;
            margin: 0 auto;
        }
    }
	.right {
		width: 200px;
		height: 150px;
		background: #f56c6c;
		margin: 0 auto;
	}
}
</style>