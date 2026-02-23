import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Music, Video, Star, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [videoInfo, setVideoInfo] = useState(null);
    const [format, setFormat] = useState('mp3');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            const fetchInfo = async () => {
                setLoading(true);
                setError('');
                try {
                    const res = await axios.post(`${API_BASE}/info`, { url });
                    setVideoInfo(res.data);
                } catch (err) {
                    setError('Não foi possível obter informações do vídeo.');
                } finally {
                    setLoading(false);
                }
            };
            const timer = setTimeout(fetchInfo, 1000);
            return () => clearTimeout(timer);
        }
    }, [url]);

    const handleDownload = async () => {
        if (!url) return;
        setDownloading(true);
        setError('');
        setSuccess('');
        try {
            const res = await axios.post(`${API_BASE}/download`, { url, format });
            setSuccess(`Download concluído: ${res.data.title}`);

            // Criar link temporário para forçar o download
            const downloadUrl = `${API_BASE}/get-file?path=${encodeURIComponent(res.data.file_path)}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', res.data.title);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Erro ao processar download.';
            setError(errorMsg);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="app-container">
            <header className="glass-header animate-fade-in">
                <h1>YouTube <span className="highlight">Downloader</span></h1>
                <p>Baixe músicas e vídeos em alta qualidade</p>
            </header>

            <main className="main-content">
                <div className="card glass animate-slide-up">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Cole o link do YouTube aqui..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="url-input"
                        />
                        {loading && <Loader2 className="spinner" />}
                    </div>

                    {videoInfo && (
                        <div className="video-preview animate-fade-in">
                            <img src={videoInfo.thumbnail} alt="Thumbnail" />
                            <div className="video-details">
                                <h3>{videoInfo.title}</h3>
                                <p>Sugestão de nome identificada!</p>
                            </div>
                        </div>
                    )}

                    <div className="options-grid">
                        <button
                            className={`option-btn ${format === 'mp3' ? 'active' : ''}`}
                            onClick={() => setFormat('mp3')}
                        >
                            <Music size={20} />
                            <span>MP3</span>
                        </button>
                        <button
                            className={`option-btn ${format === 'wav' ? 'active' : ''}`}
                            onClick={() => setFormat('wav')}
                        >
                            <Star size={20} />
                            <span>WAV</span>
                        </button>
                        <button
                            className={`option-btn ${format === 'audio_hq' ? 'active' : ''}`}
                            onClick={() => setFormat('audio_hq')}
                        >
                            <CheckCircle size={20} />
                            <span>Audio HQ</span>
                        </button>
                        <button
                            className={`option-btn ${format === 'video' ? 'active' : ''}`}
                            onClick={() => setFormat('video')}
                        >
                            <Video size={20} />
                            <span>Vídeo HD</span>
                        </button>
                    </div>

                    <button
                        className="download-btn"
                        onClick={handleDownload}
                        disabled={downloading || !url}
                    >
                        {downloading ? (
                            <><Loader2 className="spinner" /> Processando...</>
                        ) : (
                            <><Download size={22} /> Baixar Agora</>
                        )}
                    </button>

                    {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
                    {success && <div className="success-msg"><CheckCircle size={18} /> {success}</div>}
                </div>
            </main>

            <footer className="footer animate-fade-in">
                <p>Otimizado para dispositivos móveis</p>
            </footer>
        </div>
    );
}

export default App;
