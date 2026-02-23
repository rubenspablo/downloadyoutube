from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from downloader import get_video_info, download_media
import os
from fastapi.responses import FileResponse

app = FastAPI()

# Configuração do CORS para permitir o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format: str

@app.get("/")
async def root():
    return {"status": "online", "message": "API do YouTube Downloader ativa. Acesse o frontend na porta 5173."}

@app.post("/info")
async def get_info(request: URLRequest):
    info = get_video_info(request.url)
    if "error" in info:
        raise HTTPException(status_code=400, detail=info["error"])
    return info

@app.post("/download")
async def start_download(request: DownloadRequest):
    result = download_media(request.url, request.format)
    if result["status"] == "error":
        # Verificar se o erro é falta de ffmpeg
        msg = result["message"]
        if "ffmpeg" in msg.lower():
            msg = "FFmpeg não encontrado. É necessário instalar o FFmpeg para converter áudio."
        raise HTTPException(status_code=500, detail=msg)
    
    return result

@app.get("/get-file")
async def get_file(path: str):
    import urllib.parse
    decoded_path = urllib.parse.unquote(path)
    if os.path.exists(decoded_path):
        filename = os.path.basename(decoded_path)
        return FileResponse(
            decoded_path, 
            filename=filename,
            media_type='application/octet-stream',
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{urllib.parse.quote(filename)}"
            }
        )
    raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {decoded_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
