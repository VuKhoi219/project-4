<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    public $timestamps = false; // nếu bảng có created_at, updated_at

    protected $fillable = [
        'creator_id',
        'category_id',
        'title',
        'description',
        'summary',
        'source_type',
        'file_id',
        'avatar',
    ];

    // Quan hệ với User (creator)
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    // Quan hệ với Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Quan hệ với UploadedFile
    public function file()
    {
        return $this->belongsTo(UploadedFile::class, 'file_id');
    }

    // Quan hệ với Question
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    // Quan hệ với FinalResult
    public function finalResults()
    {
        return $this->hasMany(FinalResult::class);
    }
}
