<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\SourceType;

class UploadedFile extends Model
{
    protected $table = 'uploaded_files';

    protected $fillable = [
        'user_id',
        'original_filename',
        'stored_filename',
        'file_path',
        'file_size',
        'file_type',
        'mime_type',
        'is_processed',
        'processed_content',
        'is_public',
        'allow_reuse',
        'content_embedding',
        'embedding_updated_at',
        'source_type',
    ];

    protected $casts = [
        'is_processed' => 'boolean',
        'is_public' => 'boolean',
        'allow_reuse' => 'boolean',
        'upload_date' => 'datetime',
        'embedding_updated_at' => 'datetime',
        'source_type' => SourceType::class, // cast enum
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Phương thức tiện ích
    public function isReadyForEmbedding(): bool
    {
        return $this->is_processed && !empty($this->processed_content);
    }

    public function updateEmbedding(string $embedding): void
    {
        $this->content_embedding = $embedding;
        $this->embedding_updated_at = now();
        $this->save();
    }
}
