<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disertante extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'apellido', 'email', 'biografia', 'activo'];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function eventos()
    {
        return $this->belongsToMany(Evento::class, 'disertante_evento')
            ->withTimestamps();
    }

    public function seguidores()
    {
        return $this->belongsToMany(User::class, 'disertante_user')
            ->withTimestamps();
    }
}