import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold tracking-tight">Weather Explorer</h1>
      </header>
      
      <main className="flex-1 p-8">
        <p className="text-muted-foreground">
          Welcome to the Weather Explorer. This is a blank canvas for the Full Stack Engineer assignment.
        </p>
      </main>

      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
