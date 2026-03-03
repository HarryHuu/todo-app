import { useState, useEffect } from 'react'
import './App.css'
import type { Todo, Priority, Filter } from './types'

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue] as const
}

const DAYS = ['日', '一', '二', '三', '四', '五', '六']

function getDateString() {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${DAYS[now.getDay()]}`
}

const PRIORITY_LABEL: Record<Priority, string> = { high: '高', medium: '中', low: '低' }

export default function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [filter, setFilter] = useState<Filter>('all')
  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleAdd = () => {
    const text = inputText.trim()
    if (!text) return
    setTodos([{ id: Date.now(), text, done: false, priority }, ...todos])
    setInputText('')
  }

  const handleToggle = (id: number) => {
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const handleDelete = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const handleClearDone = () => {
    setTodos(todos.filter(t => !t.done))
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const doneCount = todos.filter(t => t.done).length

  const emptyMessage =
    filter === 'done' ? '暂无已完成任务' : filter === 'active' ? '没有待完成任务' : '添加你的第一个任务吧'

  return (
    <div className="container">
      <h1>待办事项</h1>
      <p className="subtitle">{getDateString()}</p>

      <div className="input-row">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="添加新任务..."
          maxLength={100}
        />
        <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="low">低</option>
        </select>
        <button className="btn-add" onClick={handleAdd} title="添加">
          +
        </button>
      </div>

      <div className="filter-bar">
        <div className="filters">
          {(['all', 'active', 'done'] as Filter[]).map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'active' ? '待完成' : '已完成'}
            </button>
          ))}
        </div>
        <span className="stats">
          {doneCount}/{todos.length} 已完成
        </span>
      </div>

      <div className="todo-list">
        {filtered.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">✓</span>
            {emptyMessage}
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className={`todo-item${t.done ? ' done' : ''}`}>
              <input type="checkbox" checked={t.done} onChange={() => handleToggle(t.id)} />
              <span className="todo-text">{t.text}</span>
              <span className={`priority-badge ${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
              <button className="btn-delete" onClick={() => handleDelete(t.id)} title="删除">
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {doneCount > 0 && (
        <button className="clear-btn" onClick={handleClearDone}>
          清除已完成
        </button>
      )}
    </div>
  )
}
