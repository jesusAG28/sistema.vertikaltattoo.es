<script setup>
import { ref } from 'vue';
import ImageUpload from '@/components/stage/ImageUpload.stage.vue';

const initialValues = ref({
    // image: 'https://transport-api.test/demo/assets/user/1/image/poster.jpeg'
    image: null
});
const uploadId = ref(null);
const unlink = ref(false);
</script>

<template>
    <div class="flex flex-col gap-4">
        <div>
            <div>
                <pre>upload_id: {{ uploadId ?? 'null' }}</pre>
                <pre>unlink_image: {{ unlink }}</pre>
            </div>
            <ImageUpload :initial-image-src="initialValues.image" v-model:upload-id="uploadId" v-model:unlink-image="unlink" />
        </div>
    </div>
</template>
