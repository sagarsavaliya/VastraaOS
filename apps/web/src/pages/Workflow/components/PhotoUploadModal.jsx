import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, Trash2, Image as ImageIcon, Zap } from 'lucide-react';
import { uploadPhotos } from '../services/workflowService';
import { useToast } from '../../../components/UI/Toast';
import { ModernButton } from '../../../components/UI/CustomInputs';
import Modal from '../../../components/UI/Modal';

const PhotoUploadModal = ({ isOpen, onClose, task, onSuccess }) => {
    const { showToast } = useToast();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFiles([]);
            setPreviews([]);
        }
    }, [isOpen]);

    const handleFileSelect = (files) => {
        const fileArray = Array.from(files).slice(0, 5 - selectedFiles.length); // Max 5 photos

        if (fileArray.length === 0) return;

        const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== fileArray.length) {
            showToast('Only image files are allowed', 'error');
        }

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const handleRemoveFile = (index) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            showToast('Please select at least one photo', 'error');
            return;
        }

        setLoading(true);
        try {
            await uploadPhotos(task.id, selectedFiles);
            showToast('Photos uploaded', 'success');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error('Error uploading photos:', error);
            showToast(error.response?.data?.message || 'Failed to upload photos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            previews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, []);

    const footer = (
        <div className="flex items-center gap-4 w-full">
            <ModernButton
                variant="secondary"
                onClick={onClose}
                className="flex-1 !rounded-xl"
            >
                CANCEL
            </ModernButton>
            <ModernButton
                onClick={handleUpload}
                loading={loading}
                disabled={selectedFiles.length === 0}
                variant="primary"
                className="flex-[2] !rounded-xl shadow-lg shadow-primary/20"
            >
                <Zap size={18} className="mr-2" />
                INITIATE UPLOAD
            </ModernButton>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Capturing Evidence"
            footer={footer}
            size="md"
        >
            <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Camera size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-text-main uppercase tracking-wider">Reference Order</p>
                        <p className="text-sm font-black text-primary uppercase">{task?.order?.order_number || 'REGULAR TASK'}</p>
                    </div>
                </div>

                {/* Upload Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300
                        ${dragActive
                            ? 'border-primary bg-primary/5 scale-[0.99]'
                            : 'border-border hover:border-primary/50 hover:bg-background-content/5'}
                    `}
                >
                    <div className="w-16 h-16 rounded-2xl bg-background-content/10 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload size={28} className={`text-text-muted transition-colors ${dragActive || 'group-hover:text-primary'}`} />
                    </div>

                    <p className="text-base font-bold text-text-main mb-1 uppercase">Drop visual data here</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Or click to browse storage</p>

                    <div className="mt-6 flex justify-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[8px] font-bold uppercase text-text-muted">JPG / PNG</span>
                        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[8px] font-bold uppercase text-text-muted">MAX 5MB</span>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                </div>

                {/* Preview Grid */}
                {previews.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={14} className="text-primary" />
                                <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest">
                                    Queue ({selectedFiles.length}/5)
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {previews.map((preview, index) => (
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-background shadow-sm">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile(index);
                                        }}
                                        className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-rose-500/30"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PhotoUploadModal;
