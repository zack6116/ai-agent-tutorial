import DefaultTheme from 'vitepress/theme'
import GuideLayout from './GuideLayout.vue'
import './guide.css'
import ReferenceLibrary from '../components/ReferenceLibrary.vue'
import './replica.css'
import './roadmap.css'

export default {
  extends: DefaultTheme,
  Layout: GuideLayout,
  enhanceApp({ app }) { app.component('ReferenceLibrary', ReferenceLibrary) }
}
