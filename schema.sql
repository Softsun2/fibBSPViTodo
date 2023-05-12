create table Tasks (
  id int auto_increment,
  title text not null,
  description text,
  isDone boolean not null,           
  time timestamp not null default now(),

  -- the grouping of a task
  -- if user defined, if not should fall into "default" group
  -- taskGroup text,

  -- optional duedate
  -- dueDate timestamp,

  primary key(id)
);

