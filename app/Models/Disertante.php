<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disertante extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'apellido', 'email', 'biografia'];

    public function eventos()
    {
        return $this->belongsToMany(Evento::class, 'disertante_evento')
            ->withTimestamps();
    }
}