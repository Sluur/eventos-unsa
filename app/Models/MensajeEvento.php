<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MensajeEvento extends Model
{
    use HasFactory;

    protected $table = 'mensajes_evento';

    protected $fillable = ['evento_id', 'user_id', 'asunto', 'cuerpo', 'destinatarios', 'cantidad'];

    public function evento()
    {
        return $this->belongsTo(Evento::class);
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
