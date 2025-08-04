import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prsima";
import { isAdmin } from "@/lib/isAdmin";

// Default comprehensive questions for employee evaluation
const getDefaultEmployeeQuestions = () => [
  // Section 1: Work Quality & Execution
  {
    id: "work_quality_1",
    label: "How would you rate the overall quality of this employee's work?",
    type: "rating",
    section: "Work Quality & Execution"
  },
  {
    id: "work_quality_2",
    label: "Does the employee consistently meet deadlines and manage time effectively?",
    type: "rating",
    section: "Work Quality & Execution"
  },
  {
    id: "work_quality_3",
    label: "How detail-oriented is the employee in their tasks and deliverables?",
    type: "rating",
    section: "Work Quality & Execution"
  },
  {
    id: "work_quality_4",
    label: "How well does the employee follow project guidelines and instructions?",
    type: "rating",
    section: "Work Quality & Execution"
  },
  {
    id: "work_quality_5",
    label: "Any specific example where the employee demonstrated exceptional quality?",
    type: "text",
    section: "Work Quality & Execution"
  },
  // Section 2: Collaboration & Communication
  {
    id: "collaboration_1",
    label: "How effectively does the employee communicate with peers and supervisors?",
    type: "rating",
    section: "Collaboration & Communication"
  },
  {
    id: "collaboration_2",
    label: "Is the employee receptive to feedback and willing to make improvements?",
    type: "rating",
    section: "Collaboration & Communication"
  },
  {
    id: "collaboration_3",
    label: "How well does the employee collaborate with team members on projects?",
    type: "rating",
    section: "Collaboration & Communication"
  },
  {
    id: "collaboration_4",
    label: "Does the employee actively participate in team meetings and discussions?",
    type: "rating",
    section: "Collaboration & Communication"
  },
  {
    id: "collaboration_5",
    label: "Any specific examples of effective collaboration or communication?",
    type: "text",
    section: "Collaboration & Communication"
  },
  // Section 3: Problem Solving & Innovation
  {
    id: "problem_solving_1",
    label: "How well does the employee identify and solve problems independently?",
    type: "rating",
    section: "Problem Solving & Innovation"
  },
  {
    id: "problem_solving_2",
    label: "Does the employee suggest innovative solutions or process improvements?",
    type: "rating",
    section: "Problem Solving & Innovation"
  },
  {
    id: "problem_solving_3",
    label: "How well does the employee adapt to new challenges and changes?",
    type: "rating",
    section: "Problem Solving & Innovation"
  },
  {
    id: "problem_solving_4",
    label: "Does the employee take initiative in identifying areas for improvement?",
    type: "rating",
    section: "Problem Solving & Innovation"
  },
  {
    id: "problem_solving_5",
    label: "Any specific examples of problem-solving or innovative thinking?",
    type: "text",
    section: "Problem Solving & Innovation"
  },
  // Section 4: Leadership & Growth
  {
    id: "leadership_1",
    label: "How well does the employee demonstrate leadership qualities?",
    type: "rating",
    section: "Leadership & Growth"
  },
  {
    id: "leadership_2",
    label: "Does the employee take responsibility for their actions and decisions?",
    type: "rating",
    section: "Leadership & Growth"
  },
  {
    id: "leadership_3",
    label: "How well does the employee mentor or support junior team members?",
    type: "rating",
    section: "Leadership & Growth"
  },
  {
    id: "leadership_4",
    label: "Does the employee actively seek opportunities for professional development?",
    type: "rating",
    section: "Leadership & Growth"
  },
  {
    id: "leadership_5",
    label: "Any specific examples of leadership or growth initiatives?",
    type: "text",
    section: "Leadership & Growth"
  },
  // Section 5: Overall Assessment
  {
    id: "overall_1",
    label: "How would you rate the employee's overall performance this period?",
    type: "rating",
    section: "Overall Assessment"
  },
  {
    id: "overall_2",
    label: "What are the employee's key strengths?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_3",
    label: "What areas does the employee need to improve?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_4",
    label: "What specific goals should the employee focus on for the next period?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_5",
    label: "Would you recommend this employee for promotion or advancement?",
    type: "multiple-choice",
    options: ["Yes", "No", "Not yet, but potential", "Need more time to assess"],
    section: "Overall Assessment"
  }
];

// Default comprehensive questions for manager evaluation
const getDefaultManagerQuestions = () => [
  // Section 1: Leadership & Management
  {
    id: "leadership_1",
    label: "How effectively does the manager lead and motivate their team?",
    type: "rating",
    section: "Leadership & Management"
  },
  {
    id: "leadership_2",
    label: "Does the manager provide clear direction and set appropriate goals?",
    type: "rating",
    section: "Leadership & Management"
  },
  {
    id: "leadership_3",
    label: "How well does the manager delegate tasks and responsibilities?",
    type: "rating",
    section: "Leadership & Management"
  },
  {
    id: "leadership_4",
    label: "Does the manager create a positive and productive work environment?",
    type: "rating",
    section: "Leadership & Management"
  },
  {
    id: "leadership_5",
    label: "Any specific examples of effective leadership or management?",
    type: "text",
    section: "Leadership & Management"
  },
  // Section 2: Communication & Feedback
  {
    id: "communication_1",
    label: "How effectively does the manager communicate with team members?",
    type: "rating",
    section: "Communication & Feedback"
  },
  {
    id: "communication_2",
    label: "Does the manager provide regular and constructive feedback?",
    type: "rating",
    section: "Communication & Feedback"
  },
  {
    id: "communication_3",
    label: "How well does the manager handle conflicts and difficult situations?",
    type: "rating",
    section: "Communication & Feedback"
  },
  {
    id: "communication_4",
    label: "Does the manager actively listen to team concerns and suggestions?",
    type: "rating",
    section: "Communication & Feedback"
  },
  {
    id: "communication_5",
    label: "Any specific examples of effective communication or feedback?",
    type: "text",
    section: "Communication & Feedback"
  },
  // Section 3: Strategic Thinking & Planning
  {
    id: "strategic_1",
    label: "How well does the manager think strategically and plan for the future?",
    type: "rating",
    section: "Strategic Thinking & Planning"
  },
  {
    id: "strategic_2",
    label: "Does the manager identify and address potential challenges proactively?",
    type: "rating",
    section: "Strategic Thinking & Planning"
  },
  {
    id: "strategic_3",
    label: "How well does the manager align team goals with organizational objectives?",
    type: "rating",
    section: "Strategic Thinking & Planning"
  },
  {
    id: "strategic_4",
    label: "Does the manager make data-driven decisions and use resources effectively?",
    type: "rating",
    section: "Strategic Thinking & Planning"
  },
  {
    id: "strategic_5",
    label: "Any specific examples of strategic thinking or planning?",
    type: "text",
    section: "Strategic Thinking & Planning"
  },
  // Section 4: Team Development & Performance
  {
    id: "team_dev_1",
    label: "How well does the manager develop and mentor team members?",
    type: "rating",
    section: "Team Development & Performance"
  },
  {
    id: "team_dev_2",
    label: "Does the manager recognize and reward good performance?",
    type: "rating",
    section: "Team Development & Performance"
  },
  {
    id: "team_dev_3",
    label: "How well does the manager manage team performance and productivity?",
    type: "rating",
    section: "Team Development & Performance"
  },
  {
    id: "team_dev_4",
    label: "Does the manager create opportunities for team growth and learning?",
    type: "rating",
    section: "Team Development & Performance"
  },
  {
    id: "team_dev_5",
    label: "Any specific examples of team development or performance management?",
    type: "text",
    section: "Team Development & Performance"
  },
  // Section 5: Overall Assessment
  {
    id: "overall_1",
    label: "How would you rate the manager's overall effectiveness?",
    type: "rating",
    section: "Overall Assessment"
  },
  {
    id: "overall_2",
    label: "What are the manager's key strengths?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_3",
    label: "What areas does the manager need to improve?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_4",
    label: "What specific goals should the manager focus on for the next period?",
    type: "text",
    section: "Overall Assessment"
  },
  {
    id: "overall_5",
    label: "Would you recommend this manager for advancement or additional responsibilities?",
    type: "multiple-choice",
    options: ["Yes", "No", "Not yet, but potential", "Need more time to assess"],
    section: "Overall Assessment"
  }
];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Update manager form
    const managerForm = await prisma.form.upsert({
      where: { id: "manager-form" },
      update: {
        title: "Manager Assessment Form",
        description: "Comprehensive evaluation form for manager performance and leadership",
        questions: getDefaultManagerQuestions(),
      },
      create: {
        id: "manager-form",
        title: "Manager Assessment Form",
        description: "Comprehensive evaluation form for manager performance and leadership",
        questions: getDefaultManagerQuestions(),
        createdBy: userId,
      },
    });

    // Update employee form
    const employeeForm = await prisma.form.upsert({
      where: { id: "employee-form" },
      update: {
        title: "Employee Performance Form",
        description: "Comprehensive evaluation form for employee performance and development",
        questions: getDefaultEmployeeQuestions(),
      },
      create: {
        id: "employee-form",
        title: "Employee Performance Form",
        description: "Comprehensive evaluation form for employee performance and development",
        questions: getDefaultEmployeeQuestions(),
        createdBy: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Forms updated with new comprehensive questions",
      managerForm,
      employeeForm,
    });
  } catch (error) {
    console.error("Error updating forms:", error);
    return NextResponse.json(
      { error: "Failed to update forms" },
      { status: 500 }
    );
  }
} 