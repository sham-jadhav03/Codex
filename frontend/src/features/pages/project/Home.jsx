import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const { user, logout } = useAuth()
  const { createProject: apiCreateProject, getAllProjects } = useProject()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [project, setProject] = useState([])

  const navigate = useNavigate()

  function createProject(e) {
    e.preventDefault()
    console.log({ projectName })

    apiCreateProject(projectName)
      .then((res) => {
        console.log(res)
        setIsModalOpen(false)
        // Refresh project list after creation
        getAllProjects().then((data) => {
          setProject(data.projects)
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getAllProjects().then((data) => {
      setProject(data.projects)
    }).catch(err => {
      console.log(err)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className='p-8 flex gap-8 h-screen w-screen bg-gray-950 text-white font-sans'>
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-6 rounded-r-2xl shadow-2xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Codex AI</h1>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 text-white font-medium border border-gray-700 shadow-sm">
            <i className="ri-folder-add-line text-lg text-blue-400"></i>
            Dashboard
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <i className="ri-settings-4-line text-lg"></i>
            Settings
          </button>
          <button onClick={logout} className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors">
            <i className="ri-logout-box-r-line text-lg"></i>
            Logout
          </button>
        </nav>
        <div className='mt-auto flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold'>
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className='overflow-hidden'>
            <p className='text-sm font-medium truncate'>{user?.email || 'User'}</p>
            <p className='text-xs text-gray-400 truncate'>Plan: Free</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <header className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-100'>Your Projects</h2>
          <div className="flex gap-4">
            <button className='p-2 px-4 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-colors flex items-center gap-2 text-sm'>
              <i className="ri-search-line"></i> Search
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <i className="ri-add-line text-lg transition-transform group-hover:rotate-90"></i>
              New Project
            </button>
          </div>
        </header>

        <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            project.map((project) => (
              <div key={project._id}
                onClick={() => {
                  navigate(`/project`, {
                    state: { project }
                  })
                }}
                className="project group cursor-pointer p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col gap-4 relative overflow-hidden"
              >
                <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2'></div>

                <div className='flex justify-between items-start z-10'>
                  <h2 className='text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors'>{project.name}</h2>
                  <i className="ri-arrow-right-up-line text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"></i>
                </div>

                <div className="flex items-center justify-between text-gray-400 text-sm mt-2 z-10">
                  <div className='flex items-center gap-1'>
                    <i className="ri-user-line text-blue-400"></i>
                    <span>{project.users.length} Collaborators</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <i className="ri-code-s-slash-line"></i>
                    <span>React/Node</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all scale-100 relative">

            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-white">Create New Project</h2>
            <form onSubmit={createProject} className='flex flex-col gap-4'>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  autoFocus
                  placeholder='My Awesome App'
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-600"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="px-5 py-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 transition-colors" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all font-medium">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home