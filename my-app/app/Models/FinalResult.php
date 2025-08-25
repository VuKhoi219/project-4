<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinalResult extends Model
{
    protected $table = 'final_result';

    // Nếu muốn mass assignment
    protected $fillable = [
        'user_id',
        'quiz_id',
        'name_player',
        'points',
    ];

    // Quan hệ tới User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Quan hệ tới Quiz
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
