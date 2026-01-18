export const ANNUAL_CUMULATIVE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; font-size: 7.5pt; }
        .report-container { width: 100%; border: 2px double #000; padding: 10px; box-sizing: border-box; position: relative; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
        .header h1 { margin: 2px 0; font-size: 18pt; text-transform: uppercase; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 3px; text-align: center; }
        th { background-color: #e0e0e0; font-weight: bold; text-transform: uppercase; font-size: 7pt; }
        .subject-col { text-align: left; width: 140px; font-weight: bold; }
        
        .student-bio { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; }
        
        .watermark { 
            position: absolute; 
            top: 50%; left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            font-size: 120pt; 
            color: rgba(200, 200, 200, 0.1); 
            pointer-events: none; 
            text-transform: uppercase; 
            z-index: -1;
        }
        .watermark-img {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            opacity: 0.1;
            z-index: -1;
        }
        
        .main-grid { display: grid; grid-template-columns: 2.5fr 1fr; gap: 15px; }
        .behavioural-table { width: 100%; font-size: 7pt; }
        .summary-box { border: 2px solid #000; padding: 10px; }
        .remark-area { border: 1px solid #000; height: 40px; margin-top: 5px; padding: 5px; font-style: italic; }
    </style>
</head>
<body>
    <div class="report-container">
        {{#if schoolWatermark}}
        <img src="{{schoolWatermark}}" class="watermark-img" />
        {{else}}
        <div class="watermark">ANNUAL REPORT</div>
        {{/if}}

        <div class="header">
            {{#if schoolLogo}}
            <img src="{{schoolLogo}}" style="height: 60px; float: left; position: absolute; left: 20px;" />
            {{/if}}
            <h1>{{schoolName}}</h1>
            <h2 style="margin: 5px 0; font-size: 14pt;">JUNIOR SECONDARY ANNUAL CUMULATIVE REPORT SHEET</h2>
            <p style="margin: 0; font-size: 10pt;"><b>{{sessionName}} ACADEMIC SESSION</b></p>
        </div>

        <div class="student-bio">
            <span>NAME: {{studentName}}</span>
            <span>CLASS: {{className}}</span>
            <span>SESSION: {{sessionName}}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th rowspan="2" class="subject-col">SUBJECT</th>
                    <th colspan="3">FIRST TERM</th>
                    <th colspan="3">SECOND TERM</th>
                    <th colspan="3">THIRD TERM</th>
                    <th colspan="3">ANNUAL AVERAGE</th>
                    <th rowspan="2" style="width: 100px;">REMARK</th>
                </tr>
                <tr>
                    <th>SCORE</th><th>POS</th><th>GRADE</th>
                    <th>SCORE</th><th>POS</th><th>GRADE</th>
                    <th>SCORE</th><th>POS</th><th>GRADE</th>
                    <th>SCORE</th><th>CLASS AVG</th><th>GRADE</th>
                </tr>
            </thead>
            <tbody>
                {{#each subjects}}
                <tr>
                    <td class="subject-col">{{name}}</td>
                    <td>{{term1Score}}</td><td>{{term1Pos}}</td><td>{{term1Grade}}</td>
                    <td>{{term2Score}}</td><td>{{term2Pos}}</td><td>{{term2Grade}}</td>
                    <td>{{term3Score}}</td><td>{{term3Pos}}</td><td>{{term3Grade}}</td>
                    <td style="background: #f0f0f0; font-weight: bold;">{{annualAvg}}</td><td>{{classAvg}}</td><td>{{annualGrade}}</td>
                    <td style="text-align: left; font-size: 6.5pt;">{{annualRemark}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="main-grid">
            <div>
                <table class="behavioural-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">BEHAVIOUR AND ACTIVITIES</th>
                            <th style="width: 40px;">KEY</th>
                            <th style="text-align: left;">KEY TO RATINGS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Punctuality</td><td>{{behaviouralRatings.punctuality}}</td><td>A - EXCELLENT</td></tr>
                        <tr><td>Attendance in Class</td><td>{{behaviouralRatings.classAttendance}}</td><td>B - VERY GOOD</td></tr>
                        <tr><td>Attentiveness in Class</td><td>{{behaviouralRatings.attentiveness}}</td><td>C - GOOD</td></tr>
                        <tr><td>Carrying out Assignments</td><td>{{behaviouralRatings.carryingOutAssignments}}</td><td>D - FAIR</td></tr>
                        <tr><td>Participation in School Activities</td><td>{{behaviouralRatings.participation}}</td><td>E - POOR</td></tr>
                        <tr><td>Neatness</td><td>{{behaviouralRatings.neatness}}</td><td></td></tr>
                        <tr><td>Honesty</td><td>{{behaviouralRatings.honesty}}</td><td></td></tr>
                        <tr><td>Self Control</td><td>{{behaviouralRatings.selfControl}}</td><td></td></tr>
                    </tbody>
                </table>
            </div>
            
            <div class="summary-box">
                <div style="font-weight: bold; text-align: center; border-bottom: 1px solid #000; margin-bottom: 5px;">SESSION SUMMARY</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>TOTAL:</span> <b>{{totalAnnualScore}}</b>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>AVERAGE:</span> <b>{{overallAnnualAvg}}</b>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>POSITION:</span> <b>{{classPosition}}</b>
                </div>
                <div style="background: #000; color: #fff; text-align: center; padding: 5px; margin: 10px 0; font-weight: bold;">
                    CGPA: {{cgpa}} | {{classOfResult}}
                </div>
                <div style="font-weight: bold;">PRINCIPAL'S REMARK:</div>
                <div class="remark-area">{{finalRemark}}</div>
                <div style="margin-top: 15px; font-weight: bold; text-align: center;">
                    PROMOTED: <span style="text-decoration: underline;">{{promotionStatus}}</span>
                </div>
                <div style="margin-top: 20px; text-align: center; border-top: 1px solid #000; padding-top: 5px;">
                    PRINCIPAL'S SIGNATURE
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
