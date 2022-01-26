'use strict';

import {mount} from './core/widgets/mount.js';
import {Row} from './core/widgets/builders.js';
import {myList, nav} from './rgb39/widget.js';



mount(Row({
    children:[
        myList,nav
    ]
}));

