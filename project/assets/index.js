import moment from 'moment';
import './utils/polyfills'

import VisualRoot from 'AnalysisVisual/main';
import AnalysisFormRoot from 'AnalysisForm/main';


if (document.getElementById('visual_container'))
    VisualRoot();

if (document.getElementById('analysis_form'))
    AnalysisFormRoot();

window.moment = moment;
