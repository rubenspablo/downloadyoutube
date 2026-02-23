import yt_dlp
import os

def get_video_info(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            return {
                "title": info.get('title', 'video'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "formats": [
                    {"format_id": f['format_id'], "ext": f['ext'], "resolution": f.get('resolution')}
                    for f in info.get('formats', []) if f.get('vcodec') != 'none'
                ]
            }
        except Exception as e:
            return {"error": str(e)}

def download_media(url, format_type, quality='best'):
    # format_type can be 'mp3', 'wav', 'audio_hq', 'video'
    
    # Usar caminho absoluto baseado no arquivo downloader.py
    base_dir = os.path.dirname(os.path.abspath(__file__))
    download_path = os.path.join(base_dir, 'downloads')
    
    if not os.path.exists(download_path):
        os.makedirs(download_path)

    ydl_opts = {
        'outtmpl': f'{download_path}/%(title)s.%(ext)s',
    }

    if format_type == 'mp3':
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
    elif format_type == 'wav':
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
        })
    elif format_type == 'audio_hq':
        ydl_opts.update({
            'format': 'bestaudio/best',
        })
    else: # video
        ydl_opts.update({
            'format': 'bestvideo+bestaudio/best',
        })

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            # Se for áudio, a extensão muda no post-processamento
            if format_type in ['mp3', 'wav']:
                base, _ = os.path.splitext(filename)
                filename = f"{base}.{format_type}"
                
            return {"status": "success", "file_path": filename, "title": info.get('title')}
        except Exception as e:
            return {"status": "error", "message": str(e)}
