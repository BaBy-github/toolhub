// 工具类型定义
export interface Tool {
  id: string
  name: string
  path: string
  icon: string
  color: string
  i18nKey: string
  descriptionI18nKey: string
  featureI18nKey: string
}

// 工具列表数据
export const tools: Tool[] = [
  {
    id: 'json',
    name: 'ToJson',
    path: '/2json',
    icon: '{}',
    color: 'blue',
    i18nKey: 'home.toJson.title',
    descriptionI18nKey: 'home.toJson.description',
    featureI18nKey: 'home.toJson.feature'
  },
  {
    id: 'base64',
    name: 'ToBase64',
    path: '/2base64',
    icon: 'B64',
    color: 'green',
    i18nKey: 'home.toBase64.title',
    descriptionI18nKey: 'home.toBase64.description',
    featureI18nKey: 'home.toBase64.feature'
  },
  {
    id: 'xml',
    name: 'ToXml',
    path: '/2xml',
    icon: 'XML',
    color: 'purple',
    i18nKey: 'home.toXml.title',
    descriptionI18nKey: 'home.toXml.description',
    featureI18nKey: 'home.toXml.feature'
  },
  {
    id: 'diff',
    name: 'ToDiff',
    path: '/2diff',
    icon: '≠',
    color: 'orange',
    i18nKey: 'home.toDiff.title',
    descriptionI18nKey: 'home.toDiff.description',
    featureI18nKey: 'home.toDiff.feature'
  },
  {
    id: 'escape',
    name: 'ToEscape',
    path: '/2escape',
    icon: '\\',
    color: 'yellow',
    i18nKey: 'home.toEscape.title',
    descriptionI18nKey: 'home.toEscape.description',
    featureI18nKey: 'home.toEscape.feature'
  }
]

// 根据ID获取工具
export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}

// 根据路径获取工具
export function getToolByPath(path: string): Tool | undefined {
  return tools.find(tool => tool.path === path)
}

// 根据名称获取工具
export function getToolByName(name: string): Tool | undefined {
  return tools.find(tool => tool.name === name)
}