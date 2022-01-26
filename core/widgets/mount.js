'use strict';
import {throwError,CustomError} from '../utils/core.js';
import {t_widget} from './widgets.js';
let app = document.body.attachShadow({mode:'open'});
export const mount = (widget) => {
    widget.type === t_widget 
    && app.appendChild(widget._build()) && (widget.parent = app)
    || throwError(CustomError('请传入一个widget'))
}