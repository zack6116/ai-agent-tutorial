import mindset from './mindset.js'
import setup from './setup.js'
import prompting from './prompting.js'
import knowledge from './knowledge.js'
import building from './building.js'
import delivery from './delivery.js'

/** 课时正文，按「阶段 id → 课时编号」索引。 */
const byLayer = { mindset, setup, prompting, knowledge, building, delivery }

export function getLesson(layerId, lessonNumber) {
  return byLayer[layerId]?.[lessonNumber] || null
}

export function hasLesson(layerId, lessonNumber) {
  return Boolean(getLesson(layerId, lessonNumber))
}

export default byLayer
