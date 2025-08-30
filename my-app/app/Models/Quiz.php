<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    public $timestamps = false;

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

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function file()
    {
        return $this->belongsTo(UploadedFile::class, 'file_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order_index');
    }

    public function finalResults()
    {
        return $this->hasMany(FinalResult::class);
    }
}