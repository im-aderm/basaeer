export const END_OF_TERM_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; font-size: 10pt; }
        .report-container { width: 100%; border: 2px double #000; padding: 10px; box-sizing: border-box; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .header h1 { margin: 5px 0; font-size: 18pt; text-transform: uppercase; }
        .header h2 { margin: 5px 0; font-size: 14pt; }
        .header p { margin: 2px 0; font-size: 10pt; }
        
        .student-bio { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
        .bio-item { display: flex; border-bottom: 1px dotted #ccc; }
        .bio-label { font-weight: bold; width: 140px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; font-size: 9pt; }
        th { background-color: #f2f2f2; }
        .subject-col { text-align: left; width: 150px; }
        
        .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 5px; margin-top: 15px; }
        
        .behavioural-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .behavioural-table td:nth-child(2) { width: 40px; }
        .behavioural-table td:nth-child(1) { text-align: left; }

        .summary-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px; }
        .summary-box { border: 1px solid #000; padding: 5px; }
        .summary-row { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 2px 0; }
        
        .grading-key { font-size: 8pt; margin-top: 10px; }
        .signature-section { display: flex; justify-content: space-around; margin-top: 40px; }
        .sig-box { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
        
        .watermark { 
            position: absolute; 
            top: 50%; left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            font-size: 80pt; 
            color: rgba(200, 200, 200, 0.1); 
            pointer-events: none; 
            text-transform: uppercase; 
            z-index: -1;
        }
        .watermark-img {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            opacity: 0.1;
            z-index: -1;
        }
        .cgpa-badge {
            background-color: #000;
            color: #fff;
            padding: 5px 10px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        {{#if schoolWatermark}}
        <img src="{{schoolWatermark}}" class="watermark-img" />
        {{else}}
        <div class="watermark">OFFICIAL</div>
        {{/if}}

        <div class="header">
            <div class="school-info">
                {{#if schoolLogo}}
                <img src="{{schoolLogo}}" width="80" height="80" style="float: left; margin-right: 20px;" />
                {{/if}}
                <h1 style="color: #1a1a1a; margin: 0; font-size: 24pt;">{{schoolName}}</h1>
                <p style="margin: 5px 0; font-weight: bold;">{{schoolAddress}}</p>
                <div style="background: #000; color: #fff; display: inline-block; padding: 5px 20px; border-radius: 5px; margin-top: 10px; font-weight: black;">
                    {{sessionName}} {{reportType}}
                </div>
            </div>
            <div class="student-photo">
                {{#if studentPhoto}}
                <img src="{{studentPhoto}}" width="100" height="100" />
                {{else}}
                <div style="width: 100px; height: 100px; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #999;">PHOTO</div>
                {{/if}}
            </div>
        </div>

        <table class="student-bio">
            <tr>
                <td class="label">Student's Name:</td><td class="value" colspan="3">{{studentName}}</td>
                <td class="label">Total Score:</td><td class="value">{{totalScore}}</td>
            </tr>
            <tr>
                <td class="label">Admission No:</td><td class="value">{{admissionNo}}</td>
                <td class="label">Term Ends:</td><td class="value">{{termEnds}}</td>
                <td class="label">Average Score:</td><td class="value">{{overallAvg}}</td>
            </tr>
            <tr>
                <td class="label">Gender:</td><td class="value">{{gender}}</td>
                <td class="label">Next Term Begins:</td><td class="value">{{nextTermBegins}}</td>
                <td class="label">Lowest Avg in Class:</td><td class="value">{{lowestAvg}}</td>
            </tr>
            <tr>
                <td class="label">Class:</td><td class="value">{{className}}</td>
                <td class="label">Times Open:</td><td class="value">{{timesOpen}}</td>
                <td class="label">Highest Avg in Class:</td><td class="value">{{highestAvg}}</td>
            </tr>
            <tr>
                <td class="label">Term:</td><td class="value">{{termName}}</td>
                <td class="label">Times Present:</td><td class="value">{{timesPresent}}</td>
                <td class="label">Class Average:</td><td class="value">{{classAverage}}</td>
            </tr>
            <tr>
                <td class="label">Session:</td><td class="value">{{sessionName}}</td>
                <td class="label">Times Absent:</td><td class="value">{{timesAbsent}}</td>
                <td class="label" style="background: #f0f0f0;">Final Grade:</td><td class="value" style="font-weight: bold;">{{finalGrade}}</td>
            </tr>
            <tr>
                <td class="label">Form Teacher:</td><td class="value">{{formTeacher}}</td>
                <td class="label">No in Class:</td><td class="value">{{noInClass}}</td>
                <td class="label" style="background: #f0f0f0;">Position:</td><td class="value" style="font-weight: bold;">{{classPosition}}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 15px 0; border-bottom: 2px solid #000; padding-bottom: 5px;">
            <h2 style="margin: 0; font-size: 14pt; letter-spacing: 2px;">ACADEMIC SCORES</h2>
        </div>

        <table class="scores-table">
            <thead>
                <tr>
                    <th rowspan="2">Subjects</th>
                    {{#each assessmentHeaders}}
                    <th rowspan="2">{{this}}</th>
                    {{/each}}
                    <th rowspan="2">Total<br>(100)</th>
                    <th rowspan="2">Grade</th>
                    <th rowspan="2">POS</th>
                    <th rowspan="2">Out of</th>
                    <th rowspan="2">Low Sc</th>
                    <th rowspan="2">High Sc</th>
                    <th rowspan="2">Class Avg</th>
                    <th rowspan="2">Remark</th>
                </tr>
            </thead>
            <tbody>
                {{#each subjects}}
                <tr>
                    <td style="text-align: left; font-weight: bold;">{{name}}</td>
                    {{#each ../assessmentHeaders}}
                    <td>{{lookup ../dynamicScores this}}</td>
                    {{/each}}
                    <td style="background: #f9f9f9; font-weight: black;">{{total}}</td>
                    <td style="font-weight: bold;">{{grade}}</td>
                    <td>{{position}}</td>
                    <td>{{outOf}}</td>
                    <td>{{low}}</td>
                    <td>{{high}}</td>
                    <td>{{classAvg}}</td>
                    <td style="font-size: 8pt; text-align: left;">{{remark}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        <div style="text-align: right; font-size: 8pt; margin-top: 5px;">No of Subjects: {{subjects.length}}</div>

        <div class="behavioural-grid">
            <div>
                <div class="section-title">Behavioural & Activities Ratings</div>
                <table class="behavioural-table">
                    {{#each behavioural}}
                    <tr><td>{{category}}</td><td>{{rating}}</td></tr>
                    {{/each}}
                </table>
                <div class="grading-key">
                    <b>KEY:</b> A - Excellent, B - Good, C - Fair, D - Poor
                </div>
            </div>
            <div>
                <div class="section-title">Report Summary</div>
                <div class="summary-box">
                    <div class="summary-row"><span>Total Score:</span> <span><b>{{totalScore}}</b></span></div>
                    <div class="summary-row"><span>Average:</span> <span><b>{{overallAvg}}%</b></span></div>
                    <div class="summary-row"><span>Class Position:</span> <span><b>{{classPosition}}</b></span></div>
                    <div class="summary-row"><span>Highest Avg in Class:</span> <span>{{highestAvg}}</span></div>
                    <div class="summary-row"><span>Lowest Avg in Class:</span> <span>{{lowestAvg}}</span></div>
                    <div class="summary-row"><span>Final Grade:</span> <span>{{finalGrade}}</span></div>
                    <div class="cgpa-badge">
                        CGPA: {{cgpa}} | {{classOfResult}}
                    </div>
                </div>
                
                <div class="section-title">Final Remark</div>
                <div style="border: 1px solid #000; padding: 10px; min-height: 40px; font-style: italic;">
                    {{finalRemark}}
                </div>
            </div>
        </div>

        <div class="signature-section">
            <div class="sig-box">Form Teacher's Signature</div>
            <div class="sig-box">Principal's Signature</div>
        </div>
    </div>
</body>
</html>
`;
