-- Insert initial agents with different specialties
INSERT INTO agents (name, specialty) VALUES
    ('Planning Agent', 'Task Planning'),
    ('Decision Agent', 'Decision Making'),
    ('Analysis Agent', 'Performance Analysis'),
    ('Consensus Agent', 'Consensus Building'),
    ('Network Agent', 'Network Management');

-- Insert sample proposals
INSERT INTO proposals (content, agent_specialty, status) VALUES
    ('Implement automated task distribution system', 'Task Planning', 'pending'),
    ('Develop new consensus algorithm for decision making', 'Decision Making', 'pending'),
    ('Create performance monitoring dashboard', 'Performance Analysis', 'accepted');

-- Insert sample evaluations
INSERT INTO evaluations (proposal_id, score, explanation) VALUES
    ((SELECT id FROM proposals WHERE content LIKE '%task distribution%'), 85.5, 'Well-structured proposal with clear implementation path'),
    ((SELECT id FROM proposals WHERE content LIKE '%consensus algorithm%'), 92.0, 'Innovative approach with solid theoretical foundation'),
    ((SELECT id FROM proposals WHERE content LIKE '%monitoring dashboard%'), 88.0, 'Comprehensive monitoring solution with good metrics');

-- Insert sample tasks
INSERT INTO tasks (description, assigned_agent_id, status) VALUES
    ('Design task allocation algorithm', (SELECT id FROM agents WHERE specialty = 'Task Planning'), 'in_progress'),
    ('Implement decision tree for proposal evaluation', (SELECT id FROM agents WHERE specialty = 'Decision Making'), 'assigned'),
    ('Set up performance metrics collection', (SELECT id FROM agents WHERE specialty = 'Performance Analysis'), 'completed');

-- Insert sample performance metrics
INSERT INTO performance_metrics (metric_name, metric_value) VALUES
    ('average_proposal_score', 88.5),
    ('task_completion_rate', 75.0),
    ('agent_response_time', 2.5),
    ('consensus_achievement_rate', 92.0),
    ('system_uptime', 99.9);
