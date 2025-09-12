<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type',
        'points',
        'order_index',
        'time_limit',
    ];

    // Quan hệ với Quiz
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    // Quan hệ với Answer
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
    
    
}
