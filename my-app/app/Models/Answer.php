<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    public $timestamps = false; // nếu muốn created_at/updated_at tự động

    protected $fillable = [
        'question_id',
        'answer_text',
        'is_correct',
        'order_index',
    ];

    // Quan hệ với Question
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
