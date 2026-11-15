// Dado inválido ou ausente; guarda o campo com problema.
class ValidationError extends Error{
    
    constructor (mensagem,campo) {
        
        super (mensagem);
        this.name = "ValidationError";
        this.campo = campo;

    }

}

module.exports = ValidationError;