Implement Map-Reduce application to find sum of salaries of employees for each department in java
INPUT FILE
emp1 dept1 5000
emp2 dept1 6000
emp3 dept2 4500
emp4 dept2 5500
emp5 dept3 7000



PROGRAM

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class EmployeeSalary {

    // Mapper Class
    public static class SalaryMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
        private Text department = new Text();
        private IntWritable salary = new IntWritable();

        @Override
        protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            String line = value.toString();
            String[] fields = line.split("\\s+");
            if (fields.length == 3) {
                department.set(fields[1]);
                salary.set(Integer.parseInt(fields[2]));
                context.write(department, salary);
            }
        }
    }

    // Reducer Class
    public static class SalaryReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
        @Override
        protected void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            context.write(key, new IntWritable(sum));
        }
    }

    // Driver Class
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("Usage: EmployeeSalary <input path> <output path>");
            System.exit(-1);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Employee Salary Sum");

        job.setJarByClass(EmployeeSalary.class);
        job.setMapperClass(SalaryMapper.class);
        job.setReducerClass(SalaryReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}



