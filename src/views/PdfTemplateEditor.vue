<template>
  <div class="pdf-editor-container">
    <!-- 1. 工具栏 -->
    <div class="toolbar">
      <button @click="addText">添加文本</button>
      <button @click="addImage">添加图片</button>
      <button @click="addPlaceholder">添加占位符</button>
      <button @click="saveTemplate">保存模板</button>
      <input
        type="file"
        accept="image/*"
        ref="imageInput"
        @change="handleImageUpload"
        style="display: none"
      />
    </div>

    <!-- 2. 画布区域（A4尺寸：210mm×297mm，按72dpi转换为像素：595×842） -->
    <div class="canvas-wrapper">
      <canvas id="pdfCanvas" width="595" height="842"></canvas>
    </div>

    <!-- 3. 属性面板（选中元素时显示） -->
    <div v-if="selectedObject" class="property-panel">
      <h3>元素属性</h3>
      <div>
        <label>内容：</label>
        <input
          type="text"
          v-model="selectedObject.text"
          @input="updateObjectText"
          v-if="selectedObject.type === 'text' || selectedObject.type === 'i-text'"
        />
      </div>
      <div>
        <label>字体大小：</label>
        <input type="number" v-model.number="selectedObject.fontSize" @input="updateObjectStyle" />
      </div>
      <div>
        <label>颜色：</label>
        <input type="color" v-model="selectedObject.fill" @input="updateObjectStyle" />
      </div>
      <button @click="deleteSelectedObject">删除元素</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { fabric } from 'fabric'
import { useFileDialog } from '@vueuse/core'

// 画布实例
const canvas = ref(null)
// 选中的元素
const selectedObject = ref(null)
// 图片上传输入框
const imageInput = ref(null)

// 初始化画布
onMounted(() => {
  // 创建A4尺寸画布（595×842像素对应72dpi的A4）
  canvas.value = new fabric.Canvas('pdfCanvas', {
    backgroundColor: '#fff', // 白色背景模拟纸张
    selectionColor: 'rgba(50, 100, 255, 0.3)', // 选中元素的高亮色
    selectionBorderColor: '#3264ff',
    borderSize: 2,
    selection: true,
  })

  // 监听元素选中事件，更新属性面板
  canvas.value.on('selection:created', (e) => {
    console.log('选中元素：', e.selected[0]) // 若有多个选中元素，取第一个
    selectedObject.value = e.selected[0]
  })
  canvas.value.on('selection:updated', (e) => {
    selectedObject.value = e.selected[0]
  })
  canvas.value.on('selection:cleared', () => {
    selectedObject.value = null
  })
  canvas.value.setZoom(0.8) // 缩小到80%显示
})
// const loadTemplate = async (templateId) => {
//   const res = await axios.get(`/api/template/${templateId}`);
//   canvas.value.loadFromJSON(res.data.elements, () => {
//     canvas.value.renderAll(); // 重新渲染
//   });
// };
// 1. 添加文本元素
const addText = () => {
  const text = new fabric.IText('双击编辑文本', {
    left: 50,
    top: 50,
    fontSize: 16,
    fill: '#333',
    fontFamily: 'Arial',
  })
  canvas.value.add(text)
  canvas.value.setActiveObject(text) // 自动选中新添加的元素
}

// 2. 添加占位符（格式：{{key}}，用于后续动态填充）
const addPlaceholder = () => {
  const placeholder = new fabric.IText('{{username}}', {
    left: 50,
    top: 100,
    fontSize: 16,
    fill: '#e74c3c', // 红色标记占位符
    fontFamily: 'Arial',
    editable: true, // 允许修改占位符的key
  })
  canvas.value.add(placeholder)
  canvas.value.setActiveObject(placeholder)
}

// 3. 添加图片（触发文件选择）
const addImage = () => {
  imageInput.value.click()
}

// 处理图片上传
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    // 将图片添加到画布
    fabric.Image.fromURL(event.target.result, (img) => {
      img.scaleToWidth(200) // 缩放图片宽度
      img.set({
        left: 50,
        top: 150,
        lockRotation: false, // 允许旋转
      })
      canvas.value.add(img)
      canvas.value.setActiveObject(img)
    })
  }
  reader.readAsDataURL(file)
  e.target.value = '' // 重置输入框，允许重复选择同一张图
}

// 更新元素文本（针对文本/占位符）
const updateObjectText = () => {
  if (selectedObject.value) {
    selectedObject.value.set('text', selectedObject.value.text)
    canvas.value.renderAll() // 重新渲染画布
  }
}

// 更新元素样式（字体大小、颜色等）
const updateObjectStyle = () => {
  if (selectedObject.value) {
    selectedObject.value.set({
      fontSize: selectedObject.value.fontSize,
      fill: selectedObject.value.fill,
    })
    canvas.value.renderAll()
  }
}

// 删除选中元素
const deleteSelectedObject = () => {
  if (selectedObject.value) {
    canvas.value.remove(selectedObject.value)
    selectedObject.value = null
  }
}

// 保存模板（序列化为JSON，可提交给后端）
const saveTemplate = () => {
  // 获取画布上所有元素的JSON数据
  const templateData = {
    pageSize: 'A4',
    elements: canvas.value.toJSON([
      'type',
      'left',
      'top',
      'width',
      'height',
      'text',
      'fill',
      'fontSize',
      'src',
    ]),
  }

  // 这里模拟提交给后端，实际项目中用axios等发送请求
  console.log('模板数据：', JSON.stringify(templateData))
  alert('模板已保存！可在控制台查看JSON数据')

  // 实际项目中调用后端API：
  // await axios.post('/api/save-template', { template: templateData });
}
</script>

<style scoped>
.pdf-editor-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  flex-wrap: wrap;
  position: relative;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  width: 100%;
}

.canvas-wrapper {
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: calc(100% - 250px);
}

.property-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  padding: 15px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: #fff;
}

.property-panel div {
  margin-bottom: 10px;
}

input[type='text'],
input[type='number'],
input[type='color'] {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
}
</style>
