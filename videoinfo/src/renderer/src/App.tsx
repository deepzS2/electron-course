import type { IpcRendererEvent } from "@electron-toolkit/preload"
import { FormEventHandler, useEffect, useRef, useState } from "react"
import Versions from "./components/Versions"

function App(): JSX.Element {
  const electron = window.electron
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [videoDuration, setVideoDuration] = useState(0)

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const files = fileInputRef.current?.files

    if (!files?.length) return

    electron.ipcRenderer.send("video:submit", (files[0] as unknown as Record<string, unknown>).path)
  }

  useEffect(() => {
    const onReceiveVideoMetadata = (_: IpcRendererEvent, duration: number): void => {
      console.log(duration)

      setVideoDuration(duration)
    }

    electron.ipcRenderer.on("video:metadata", onReceiveVideoMetadata)

    return () => {
      electron.ipcRenderer.removeListener("video:metadata", onReceiveVideoMetadata)
    }
  }, [])

  return (
    <>
      <h1>Video Info</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Select a video</label>
          <input ref={fileInputRef} type="file" accept="video/*" />
        </div>
        <button type="submit">Get info</button>
      </form>
      {videoDuration && <h1>Video is {videoDuration.toFixed(2)} seconds</h1>}
      <Versions />
    </>
  )
}

export default App
